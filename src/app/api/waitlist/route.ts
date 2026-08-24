import { NextRequest, NextResponse } from "next/server";

import { destinationCountries, sourceCountries } from "@/lib/journey-data";
import {
  InvalidInput,
  MAX_BODY_BYTES,
  REFERRAL,
  TAG,
  email as cleanEmail,
  fromList,
  personName,
  text,
  token,
} from "@/lib/waitlist-input";

// The waitlist lives in Alutta's own customer-service (behind the API gateway),
// not Supabase. This route is the only public write path the site has, so it
// carries the whole door: a body-size cap, a per-IP rate limit, Turnstile, and
// strict validation of every field, before anything is handed to
// `POST /v1/customers/waitlist/` — which is idempotent by email, assigns the
// referral code, and sends the confirmation email via the transactional outbox.
// No database or email code here.
//
// On validation: country and destination are checked AGAINST THE LIST rather
// than inspected for danger, and their ISO codes are derived here rather than
// accepted from the caller. Everything else is length-capped and refused
// outright if it contains markup, a script URL or control characters. See
// lib/waitlist-input.ts for why rejecting beats sanitising.
const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

function isTurnstileDisabled() {
  return process.env.NODE_ENV !== "production" && process.env.TURNSTILE_DISABLED === "true";
}

async function verifyTurnstileToken(token: string, remoteIp: string | null) {
  if (isTurnstileDisabled()) {
    return true;
  }

  if (!process.env.TURNSTILE_SECRET_KEY) {
    throw new Error("TURNSTILE_SECRET_KEY is required.");
  }

  const formData = new FormData();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  if (remoteIp) formData.append("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

/** A per-IP brake, held in this instance's memory.
 *
 *  Deliberately the third line of defence, not the first: Turnstile stops the
 *  bots, and customer-service throttles the endpoint itself. This exists so one
 *  client cannot hammer *this* route, including the outbound Turnstile call it
 *  makes on every attempt.
 *
 *  THE LIMITS ARE GENEROUS ON PURPOSE. This audience shares addresses — a
 *  cybercafe, a university lab, a whole mobile network behind carrier NAT — so
 *  a tight per-IP cap locks out exactly the students we are trying to reach,
 *  and it does it silently. What an attacker produces that a shared network
 *  does not is a stream of REJECTED requests, so failures are budgeted far more
 *  tightly than successes.
 *
 *  Two honest limitations: a serverless deployment runs many instances, each
 *  with its own memory; and the client address comes from a header, which is
 *  trustworthy behind Cloudflare and spoofable if the origin is reached
 *  directly. Both are why this is a brake and Turnstile is the gate. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 60;
const MAX_FAILURES = 15;

type Bucket = { all: number[]; bad: number[] };
const hits = new Map<string, Bucket>();

function bucketFor(ip: string, now: number): Bucket {
  const b = hits.get(ip) ?? { all: [], bad: [] };
  b.all = b.all.filter((t) => now - t < WINDOW_MS);
  b.bad = b.bad.filter((t) => now - t < WINDOW_MS);
  hits.set(ip, b);
  return b;
}

function rateLimited(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const b = bucketFor(ip, now);
  b.all.push(now);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [key, v] of hits) {
      if (!v.all.length && !v.bad.length) hits.delete(key);
    }
  }
  return b.all.length > MAX_REQUESTS || b.bad.length > MAX_FAILURES;
}

/** Record a rejected attempt. Probing costs an address its budget; signing up
 *  successfully does not. */
function noteFailure(ip: string | null) {
  if (!ip) return;
  const now = Date.now();
  bucketFor(ip, now).bad.push(now);
}

/** Every refusal goes through here, so none of them can forget the budget. */
function refuse(ip: string | null, status: number, body: Record<string, unknown>) {
  noteFailure(ip);
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;

  try {
    // ── The door ────────────────────────────────────────────
    if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return refuse(ip, 415, { error: "Unsupported content type." });
    }

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    // Read as text first so an enormous body is refused before it is parsed.
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {
      return refuse(ip, 413, { error: "That request was too large." });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return refuse(ip, 400, { error: "Invalid request." });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return refuse(ip, 400, { error: "Invalid request." });
    }

    // ── Validation ──────────────────────────────────────────
    // Every field goes through this; nothing reaches customer-service raw.
    let firstName: string;
    let addr: string;
    let country: { code: string; name: string };
    let destination: { code: string; name: string };
    let program: string;
    let referredBy: string;
    let source: string;
    let utmSource: string;
    let utmMedium: string;
    let utmCampaign: string;

    try {
      firstName = personName(body.firstName);
      addr = cleanEmail(body.email);
      country = fromList(body.country, sourceCountries, "country", "Your country");
      destination = fromList(
        body.destination,
        destinationCountries,
        "destination",
        "Study destination",
      );
      program = text(body.program, "program", 120, { label: "Programme" });
      if (program && !TAG.test(program)) {
        throw new InvalidInput("program", "That programme name is not valid.");
      }
      referredBy = token(body.referredBy, "referredBy", 16, REFERRAL).toUpperCase();
      source = token(body.source, "source", 64, TAG) || "hero";
      const utm = (body.utm ?? {}) as Record<string, unknown>;
      utmSource = token(utm.source, "utm", 64, TAG);
      utmMedium = token(utm.medium, "utm", 64, TAG);
      utmCampaign = token(utm.campaign, "utm", 120, TAG);
    } catch (e) {
      if (e instanceof InvalidInput) {
        return refuse(ip, 400, { error: e.message, field: e.field });
      }
      throw e;
    }

    const turnstileToken = body.turnstileToken;
    if (!isTurnstileDisabled() && (!turnstileToken || typeof turnstileToken !== "string")) {
      return refuse(ip, 400, { error: "Please complete the security check." });
    }

    const turnstileValid = await verifyTurnstileToken(String(turnstileToken || ""), ip);
    if (!turnstileValid) {
      return refuse(ip, 403, { error: "Security check failed. Please try again." });
    }

    // ── Hand the signup to customer-service ──────────────────
    // It is idempotent by email, assigns the referral code, and queues the
    // confirmation email via its outbox. Full attribution is preserved:
    // utm_source is carried as `channel`, plus utm_medium/utm_campaign and the
    // study program. The country and destination codes are the canonical ones
    // from our own list, never the caller's.
    let res: Response;
    try {
      res = await fetch(`${ALUTTA_API_URL}/v1/customers/waitlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firstName,
          email: addr,
          country: country.name,
          country_code: country.code,
          destination: destination.name,
          destination_code: destination.code,
          source,
          channel: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          program,
          referred_by: referredBy,
        }),
      });
    } catch (e) {
      console.error("customer-service unreachable:", e);
      return NextResponse.json({ error: "Failed to save your details. Please try again." }, { status: 502 });
    }

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      referral_code?: string;
      error?: { message?: string };
    };

    if (!res.ok) {
      console.error("customer-service waitlist error:", res.status, data);
      return NextResponse.json(
        { error: data?.error?.message || "Failed to save your details. Please try again." },
        { status: 502 }
      );
    }

    // 201 = brand-new signup, 200 = already on the list (idempotent).
    const alreadySignedUp = res.status === 200;
    return NextResponse.json({
      success: true,
      alreadySignedUp,
      referralCode: data.referral_code,
      message: alreadySignedUp ? "You are already on the waitlist!" : "You are on the waitlist!",
    });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Alutta waitlist API" });
}
