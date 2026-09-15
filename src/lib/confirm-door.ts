/** The server side of an emailed confirmation link.
 *
 *  Two links confirm something through supervisor-service: a researcher's
 *  removal and a web team's site block. Each has two routes, and they share the
 *  rules here:
 *
 *   * CHECK, called when the page opens: is this token still good, already
 *     used, expired or unknown? It changes nothing, which is what makes it safe
 *     to call on arrival even though mail scanners open every link.
 *   * CONFIRM, called only when the person presses the button: it acts.
 *
 *  Both are POST only (a link must never do anything by itself), refuse a token
 *  that is not URL-safe and 20 to 200 characters before calling the service,
 *  share one per-IP brake per door (checking a link does not buy extra guesses
 *  at confirming one), and map the service's answer to 200, expired (410) or
 *  not valid (404). No Turnstile: the token is a long secret only the
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
 *  running. In a mock token, "expired" means expired, "unknown" means not
 *  found and "used" means already confirmed; anything else is good. */
export function supervisorMock(): boolean {
  return !isProduction() && process.env.SUPERVISOR_FINDER_MOCK === "true";
}

type Mocked = { status: number; data?: Record<string, unknown> };

const UNAVAILABLE = { code: "unavailable", error: "We could not reach Alutta right now. Please try again." };

/** One brake per door, shared by its check and confirm routes (a confirmation
 *  is sent once, perhaps twice; many tries from one address is guessing). */
const brakes = new Map<string, ReturnType<typeof createBrake>>();
function brakeFor(door: string) {
  let brake = brakes.get(door);
  if (!brake) {
    brake = createBrake({ windowMs: 10 * 60 * 1000, maxRequests: 30, maxFailures: 10 });
    brakes.set(door, brake);
  }
  return brake;
}

function tokenRoute({ door, upstreamPath, label, mock }: {
  door: string;
  upstreamPath: string;
  label: string;
  mock: (token: string) => Mocked;
}) {
  const brake = brakeFor(door);
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
        ({ status, data = {} } = mock(token));
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

  /** POST only: a link must never do anything on its own. */
  function GET() {
    return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
  }

  return { POST, GET };
}

function mockOutcome(token: string): "expired" | "unknown" | "used" | "good" {
  if (token.includes("expired")) return "expired";
  if (token.includes("unknown")) return "unknown";
  if (token.includes("used")) return "used";
  return "good";
}

function inAWeek(): string {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** The confirm route for a door: acts when the button is pressed. `sample` is
 *  what the local mock answers on success, shaped like the service's body. */
export function confirmDoor({ door, upstreamPath, sample, label }: {
  door: string;
  upstreamPath: string;
  sample: Record<string, unknown>;
  label: string;
}) {
  return tokenRoute({
    door, upstreamPath, label,
    mock: (token) => {
      const outcome = mockOutcome(token);
      if (outcome === "expired") return { status: 410 };
      if (outcome === "unknown") return { status: 404 };
      return { status: 200, data: sample };
    },
  });
}

/** The check route for a door: read-only, called when the page opens. The
 *  service answers `{status: "valid", expires_on}` or `{status: "confirmed"}`
 *  (the site block door adds `domain`), expired (410) or not found (404).
 *  `extra` is added to the local mock's 200 bodies. */
export function checkDoor({ door, upstreamPath, extra = {}, label }: {
  door: string;
  upstreamPath: string;
  extra?: Record<string, unknown>;
  label: string;
}) {
  return tokenRoute({
    door, upstreamPath, label,
    mock: (token) => {
      const outcome = mockOutcome(token);
      if (outcome === "expired") return { status: 410 };
      if (outcome === "unknown") return { status: 404 };
      if (outcome === "used") return { status: 200, data: { status: "confirmed", ...extra } };
      return { status: 200, data: { status: "valid", expires_on: inAWeek(), ...extra } };
    },
  });
}
