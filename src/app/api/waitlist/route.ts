import { NextRequest, NextResponse } from "next/server";

import { destinationCountries, sourceCountries } from "@/lib/journey-data";
import {
  InvalidInput,
  MAX_BODY_BYTES,
  REFERRAL,
  assertDeliverableDomain,
  email as cleanEmail,
  fromList,
  honeypotTripped,
  optional,
  personName,
  text,
} from "@/lib/waitlist-input";
import { SITE_URL } from "@/lib/site";
import { TURNSTILE_ACTION } from "@/lib/turnstile";

// The waitlist lives in Alutta's own customer-service (behind the API gateway),
// not Supabase. This route is the only public write path the site has, so it
// carries the whole door, in this order:
//
//   1. the request has to look like one the form sends: JSON, from this
//      site's own origin when a browser says where it came from;
//   2. a per-IP brake on this instance;
//   3. a body-size cap, before the body is parsed;
//   4. strict validation of every field, the honeypot, and a refusal of
//      throw-away mailboxes;
//   5. Turnstile, verified server-side and pinned to this form's action and
//      this site's hostname, so a token minted for another widget or another
//      site is worthless here;
//
// before anything is handed to `POST /v1/customers/waitlist/`, which is
// idempotent by email, assigns the referral code, throttles again on its own
// side, and sends the confirmation email via the transactional outbox. No
// database or email code here.
//
// On validation: country and destination are checked AGAINST THE LIST rather
// than inspected for danger, and their ISO codes are derived here rather than
// accepted from the caller. Everything else is length-capped and refused
// outright if it contains markup, a script URL or control characters. See
// lib/waitlist-input.ts for why rejecting beats sanitising.
const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

/** Hostnames a Turnstile token may have been solved on. Production is the
 *  apex and www; a Vercel preview has its own generated hostname, which is on
 *  the Turnstile site key already, so the check is skipped there rather than
 *  every preview needing an override. */
const TURNSTILE_HOSTNAMES = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || "alutta.com,www.alutta.com")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

/** How long we wait on the two upstream calls. A stuck Turnstile or gateway
 *  must fail the one request, not hold a serverless worker open. */
const UPSTREAM_TIMEOUT_MS = 8_000;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function isTurnstileDisabled() {
  return !isProduction() && process.env.TURNSTILE_DISABLED === "true";
}

type SiteVerify = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

async function verifyTurnstileToken(token: string, remoteIp: string | null): Promise<boolean> {
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
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as SiteVerify;
  if (result.success !== true) {
    return false;
  }

  // A token is only good for THIS form. Cloudflare echoes the action the
  // widget was rendered with and the hostname it was solved on; a token
  // solved elsewhere, for something else, is refused even though it is
  // genuine.
  //
  // Both checks bind only in a production build. Cloudflare's test keys (the
  // "always passes" pair used for local work) echo neither the action nor a
  // real hostname, so in development a mismatch is logged and let through.
  const hostname = (result.hostname || "").toLowerCase();
  const preview = process.env.VERCEL_ENV === "preview";
  if (result.action !== TURNSTILE_ACTION) {
    console.warn("turnstile: action mismatch", result.action);
    if (isProduction()) return false;
  }
  if (!TURNSTILE_HOSTNAMES.includes(hostname)) {
    console.warn("turnstile: hostname mismatch", hostname);
    if (isProduction() && !preview) return false;
  }
  return true;
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
 *  trustworthy behind Vercel or Cloudflare and spoofable if the origin is
 *  reached directly. Both are why this is a brake and Turnstile is the gate. */
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

/** The client address. Vercel and Cloudflare each set their own header from
 *  the connection they terminated; the first hop of x-forwarded-for is the
 *  general case. */
function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

/** A browser that names its origin must name THIS site.
 *
 *  A JSON POST from another site is already blocked by CORS (the content type
 *  forces a preflight this route never answers), so this is defence in depth
 *  against a misconfigured proxy, and it costs nothing. A request with no
 *  Origin at all (a script, curl, an old browser) passes through to Turnstile,
 *  which is the gate that actually decides. */
function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const own = new URL(req.url).origin;
  if (origin === own || origin === SITE_URL || origin === SITE_URL.replace("https://", "https://www.")) {
    return true;
  }
  // The site's own host as the platform sees it (a Vercel preview URL, or a
  // local dev server on a different port than the request URL shows).
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host && origin === `https://${host}`) return true;
  if (!isProduction() && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  try {
    // ── The door ────────────────────────────────────────────
    if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return refuse(ip, 415, { error: "Unsupported content type." });
    }

    if (!originAllowed(req)) {
      return refuse(ip, 403, { error: "Forbidden." });
    }

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
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

    // A filled honeypot is a script, not a person. Same generic refusal as
    // any other malformed request, so there is nothing to learn from it.
    if (honeypotTripped(body)) {
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
      assertDeliverableDomain(addr);
      country = fromList(body.country, sourceCountries, "country", "Your country");
      destination = fromList(
        body.destination,
        destinationCountries,
        "destination",
        "Study destination",
      );
      // Free text, and treated as such. A programme called "Master's in
      // Computer Science" is a real answer; only markup and length are
      // refused, which `text` already does.
      program = text(body.program, "program", 120, { label: "Programme" });

      // ── Attribution is BEST EFFORT, never a reason to refuse a person ────
      // These come from the URL: a referral code somebody pasted, and whatever
      // an ad platform put in utm_campaign. Ad tools emit commas, pipes,
      // colons and percent-encoding freely. Refusing the request over one
      // would mean a real student cannot join the waitlist because a marketing
      // tag was untidy — attribution lost is a rounding error, a lost signup
      // is the whole point of the page.
      referredBy = optional(body.referredBy, 16, REFERRAL).toUpperCase();
      // The form on /waitlist is the only one the site has now, so a request
      // that omits the field came from there. "hero" was the old default and
      // mislabelled those rows as a section that no longer carries a form.
      source = optional(body.source, 64) || "waitlist";
      const utm = (body.utm && typeof body.utm === "object" && !Array.isArray(body.utm) ? body.utm : {}) as Record<string, unknown>;
      utmSource = optional(utm.source, 64);
      utmMedium = optional(utm.medium, 64);
      utmCampaign = optional(utm.campaign, 120);
    } catch (e) {
      if (e instanceof InvalidInput) {
        return refuse(ip, 400, { error: e.message, field: e.field });
      }
      throw e;
    }

    const turnstileToken = body.turnstileToken;
    if (!isTurnstileDisabled() && (!turnstileToken || typeof turnstileToken !== "string" || turnstileToken.length > 2048)) {
      return refuse(ip, 400, { error: "Please complete the security check." });
    }

    let turnstileValid: boolean;
    try {
      turnstileValid = await verifyTurnstileToken(String(turnstileToken || ""), ip);
    } catch (e) {
      console.error("turnstile unreachable:", e);
      return NextResponse.json({ error: "The security check is unavailable. Please try again." }, { status: 503 });
    }
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
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch (e) {
      console.error("customer-service unreachable:", e instanceof Error ? e.message : e);
      return NextResponse.json({ error: "Failed to save your details. Please try again." }, { status: 502 });
    }

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      referral_code?: string;
      error?: { message?: string };
    };

    if (!res.ok) {
      console.error("customer-service waitlist error:", res.status, data?.error?.message);
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
    console.error("Waitlist API error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/** The route accepts a signup and nothing else. Liveness is `/api/health`. */
export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
