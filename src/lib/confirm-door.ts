/** The server side of an emailed confirmation link.
 *
 *  Two links confirm something through supervisor-service: a researcher's
 *  removal and a web team's site block. Their routes do the same thing, so it
 *  lives here once: POST only (a link must never act on its own), a token that
 *  is not URL-safe and 20 to 200 characters never reaches the service, a tight
 *  per-IP brake, and the service's answer mapped to confirmed (200), expired
 *  (410) or not valid (404). No Turnstile: the token is a long secret only the
 *  recipient's inbox holds.
 *
 *  Server-only. */

import { NextRequest, NextResponse } from "next/server";

import { UPSTREAM_TIMEOUT_MS, clientIp, createBrake, isProduction, originAllowed } from "@/lib/public-door";
import { MAX_BODY_BYTES } from "@/lib/waitlist-input";

const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";
const TOKEN = /^[A-Za-z0-9_-]{20,200}$/;

/** Local work only, never in a production build: answer as the service would,
 *  so every state of a confirmation page can be seen without supervisor-service
 *  running. A token containing "expired" is expired, one containing "unknown"
 *  is not found, anything else confirms with `sample`. */
export function supervisorMock(): boolean {
  return !isProduction() && process.env.SUPERVISOR_FINDER_MOCK === "true";
}

const UNAVAILABLE = { code: "unavailable", error: "We could not confirm this right now. Please try again." };

export function confirmDoor({ upstreamPath, sample, label }: {
  /** e.g. `/v1/supervisors/removal/confirm/` */
  upstreamPath: string;
  /** What the local mock answers on success, shaped like the service's body. */
  sample: Record<string, unknown>;
  /** For logs. */
  label: string;
}) {
  // A confirmation is sent once, perhaps twice. Many tries from one address is
  // someone guessing tokens.
  const brake = createBrake({ windowMs: 10 * 60 * 1000, maxRequests: 20, maxFailures: 10 });
  const refuse = (ip: string | null, status: number, body: Record<string, unknown>) => {
    brake.noteFailure(ip);
    return NextResponse.json(body, { status });
  };
  const tooMany = () => NextResponse.json(
    { error: "Too many attempts. Please try again in a few minutes." },
    { status: 429, headers: { "Retry-After": "600" } },
  );

  async function POST(req: NextRequest) {
    const ip = clientIp(req);
    try {
      if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
        return refuse(ip, 415, { error: "Unsupported content type." });
      }
      if (!originAllowed(req)) return refuse(ip, 403, { error: "Forbidden." });
      if (brake.limited(ip)) return tooMany();

      const raw = await req.text();
      if (raw.length > MAX_BODY_BYTES) return refuse(ip, 413, { error: "That request was too large." });
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

      let status: number;
      let data: Record<string, unknown> = {};
      if (supervisorMock()) {
        status = token.includes("expired") ? 410 : token.includes("unknown") ? 404 : 200;
        data = status === 200 ? sample : {};
      } else {
        let res: Response;
        try {
          res = await fetch(`${ALUTTA_API_URL}${upstreamPath}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
          });
        } catch (e) {
          console.error(`${label}: supervisor-service unreachable:`, e instanceof Error ? e.message : e);
          return NextResponse.json(UNAVAILABLE, { status: 502 });
        }
        status = res.status;
        data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      }

      if (status === 200) return NextResponse.json(data);
      if (status === 410) return refuse(ip, 410, { code: "expired", error: "This link has expired." });
      if (status === 404) return refuse(ip, 404, { code: "not_found", error: "This link is not valid." });
      if (status === 429) return tooMany();
      console.error(`${label}: supervisor-service answered`, status);
      return NextResponse.json(UNAVAILABLE, { status: 502 });
    } catch (err) {
      console.error(`${label} error:`, err instanceof Error ? err.message : err);
      return NextResponse.json({ ...UNAVAILABLE, error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  /** Confirmation is a POST behind a button, never a link. */
  function GET() {
    return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
  }

  return { POST, GET };
}
