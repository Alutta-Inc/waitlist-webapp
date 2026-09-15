import { NextRequest, NextResponse } from "next/server";

import { UPSTREAM_TIMEOUT_MS, clientIp, createBrake, isProduction, originAllowed } from "@/lib/public-door";
import { MAX_BODY_BYTES } from "@/lib/waitlist-input";

// A researcher confirming the removal they asked for.
//
// The link in the confirmation email opens /researchers/confirm with the token
// in the fragment; the page posts it here only when the researcher presses the
// button. A POST behind a button, never a link that acts on its own, because
// university mail scanners open every link in an email, and a GET that removed
// someone would do it before they ever read the message.
//
// No Turnstile: the token is a long random secret that only the researcher's
// inbox holds, so there is nothing to guess, and the brake stops anyone trying.
// supervisor-service decides everything else at
// `POST /v1/supervisors/removal/confirm/`.
const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

/** Tight: a researcher confirms once, perhaps twice. Many tries from one
 *  address is someone guessing tokens. */
const brake = createBrake({ windowMs: 10 * 60 * 1000, maxRequests: 20, maxFailures: 10 });

/** Tokens are URL-safe random strings. Anything else is not one of ours and
 *  never reaches the service. */
const TOKEN = /^[A-Za-z0-9_-]{20,200}$/;

function refuse(ip: string | null, status: number, body: Record<string, unknown>) {
  brake.noteFailure(ip);
  return NextResponse.json(body, { status });
}

/** Local work only, never in a production build: answer as the service would,
 *  so every state of the page can be seen. A token containing "expired" is
 *  expired, one containing "unknown" is not found, anything else confirms. */
function mocked(token: string) {
  if (isProduction() || process.env.RESEARCHER_REMOVAL_MOCK !== "true") return null;
  if (token.includes("expired")) return 410;
  if (token.includes("unknown")) return 404;
  return 200;
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
    const token = body && typeof body === "object" && !Array.isArray(body) ? body.token : undefined;
    if (typeof token !== "string" || !TOKEN.test(token)) {
      return refuse(ip, 404, { code: "not_found", error: "This link is not valid." });
    }

    let status = mocked(token);
    if (status === null) {
      let res: Response;
      try {
        res = await fetch(`${ALUTTA_API_URL}/v1/supervisors/removal/confirm/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        });
      } catch (e) {
        console.error("supervisor-service unreachable:", e instanceof Error ? e.message : e);
        return NextResponse.json({ code: "unavailable", error: "We could not confirm this right now. Please try again." }, { status: 502 });
      }
      status = res.status;
    }

    if (status === 200) return NextResponse.json({ removed: true });
    if (status === 410) return refuse(ip, 410, { code: "expired", error: "This link has expired." });
    if (status === 404) return refuse(ip, 404, { code: "not_found", error: "This link is not valid." });
    if (status === 429) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    }
    console.error("supervisor-service removal confirm error:", status);
    return NextResponse.json({ code: "unavailable", error: "We could not confirm this right now. Please try again." }, { status: 502 });
  } catch (err) {
    console.error("Removal confirm API error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ code: "unavailable", error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/** Confirmation is a POST behind a button, never a link. See the note above. */
export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
