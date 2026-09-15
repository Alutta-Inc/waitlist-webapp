import { NextRequest, NextResponse } from "next/server";

import {
  UPSTREAM_TIMEOUT_MS,
  clientIp,
  createBrake,
  isTurnstileDisabled,
  originAllowed,
  verifyTurnstileToken,
} from "@/lib/public-door";
import { supervisorMock } from "@/lib/confirm-door";
import { TURNSTILE_REMOVAL_ACTION } from "@/lib/turnstile";
import {
  InvalidInput,
  MAX_BODY_BYTES,
  email as cleanEmail,
  honeypotTripped,
  personName,
  text,
} from "@/lib/waitlist-input";

// A researcher asking to be left out of Supervisor Finder.
//
// Supervisor Finder shows students the researchers at the universities they
// are applying to, from the public record. This is the other side of that: the
// door a researcher uses to say "not me". It carries the same checks as the
// waitlist door (lib/public-door.ts), in the same order, then hands the request
// to supervisor-service at `POST /v1/supervisors/removal/`, which decides
// everything that matters:
//
//   * a confirmation link goes ONLY to an address at a university domain it
//     holds, so nobody can remove a colleague by typing their name;
//   * the answer is the same whether or not the person is listed, so this
//     form can never be used to find out who is in the directory.
//
// Locally, SUPERVISOR_FINDER_MOCK=true skips the upstream call (never in a
// production build).
//
// This route keeps that second promise too. Every request that passes
// validation and the security check gets the same success body; only a
// failure to reach the service is reported, because that is a fact about us,
// not about them.
const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

/** Tighter than the waitlist. A researcher sends this once; a stream of them
 *  from one address is somebody trying names. */
const brake = createBrake({ windowMs: 10 * 60 * 1000, maxRequests: 20, maxFailures: 10 });

function refuse(ip: string | null, status: number, body: Record<string, unknown>) {
  brake.noteFailure(ip);
  return NextResponse.json(body, { status });
}

/** The researcher's own profile page, if they give one. Optional, because the
 *  work email is what the service matches on; it helps staff tell two people
 *  with one name apart. Only a plain http(s) address, and never anything
 *  carrying markup (`text` refuses that first). */
function profileUrl(value: unknown): string {
  const raw = text(value, "profileUrl", 500, { label: "Profile link" });
  if (!raw) return "";
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new InvalidInput("profileUrl", "Please enter a full link, starting with https://.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new InvalidInput("profileUrl", "Please enter a full link, starting with https://.");
  }
  if (parsed.username || parsed.password) {
    throw new InvalidInput("profileUrl", "Please enter the link to your profile page.");
  }
  return parsed.toString();
}


export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  try {
    if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return refuse(ip, 415, { error: "Unsupported content type." });
    }

    if (!originAllowed(req)) {
      return refuse(ip, 403, { error: "Forbidden." });
    }

    if (brake.limited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    }

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

    if (honeypotTripped(body)) {
      return refuse(ip, 400, { error: "Invalid request." });
    }

    let name: string;
    let address: string;
    let profile: string;
    try {
      name = personName(body.name, "name");
      address = cleanEmail(body.email);
      profile = profileUrl(body.profileUrl);
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
      turnstileValid = await verifyTurnstileToken(String(turnstileToken || ""), ip, TURNSTILE_REMOVAL_ACTION);
    } catch (e) {
      console.error("turnstile unreachable:", e);
      return NextResponse.json({ error: "The security check is unavailable. Please try again." }, { status: 503 });
    }
    if (!turnstileValid) {
      return refuse(ip, 403, { error: "Security check failed. Please try again." });
    }

    if (!supervisorMock()) {
      let res: Response;
      try {
        res = await fetch(`${ALUTTA_API_URL}/v1/supervisors/removal/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: address, profile_url: profile }),
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        });
      } catch (e) {
        console.error("supervisor-service unreachable:", e instanceof Error ? e.message : e);
        return NextResponse.json({ error: "We could not send your request. Please try again, or write to hello@alutta.com." }, { status: 502 });
      }

      if (res.status === 429) {
        return NextResponse.json(
          { error: "Too many attempts. Please try again in a few minutes." },
          { status: 429, headers: { "Retry-After": "600" } },
        );
      }
      if (!res.ok) {
        console.error("supervisor-service removal error:", res.status);
        return NextResponse.json({ error: "We could not send your request. Please try again, or write to hello@alutta.com." }, { status: 502 });
      }
    }

    // The same body whatever the service found. See the note at the top.
    return NextResponse.json({ success: true }, { status: 202 });
  } catch (err) {
    console.error("Removal API error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/** The route accepts a removal request and nothing else. */
export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
