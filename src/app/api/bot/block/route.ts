import { NextRequest, NextResponse } from "next/server";

import { supervisorMock } from "@/lib/confirm-door";
import {
  UPSTREAM_TIMEOUT_MS,
  clientIp,
  createBrake,
  isTurnstileDisabled,
  originAllowed,
  verifyTurnstileToken,
} from "@/lib/public-door";
import { TURNSTILE_SITE_BLOCK_ACTION } from "@/lib/turnstile";
import { InvalidInput, MAX_BODY_BYTES, email as cleanEmail, honeypotTripped, text } from "@/lib/waitlist-input";

// A university web team asking AluttaBot to stop visiting their site.
//
// robots.txt already lets any site limit or block AluttaBot, and it is honoured.
// This is for the team that would rather not edit it, or cannot quickly: name
// the site and an email address at it, confirm from that inbox, and the crawl
// stops. The route carries the same checks as the other public doors
// (lib/public-door.ts), with its own Turnstile action, then hands the request to
// supervisor-service at `POST /v1/supervisors/site-block/`, which decides what
// matters:
//
//   * the confirmation goes only to an address AT that site's domain, so nobody
//     can switch the crawl off for somebody else's university;
//   * the answer is the same whether or not AluttaBot visits that site, so the
//     form cannot be used to learn which universities we read.
//
// This route keeps the second promise: every request that passes the checks
// gets the same success body. Locally, SUPERVISOR_FINDER_MOCK=true skips the
// upstream call (never in a production build).
const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

/** A web team asks once. A stream from one address is somebody trying sites. */
const brake = createBrake({ windowMs: 10 * 60 * 1000, maxRequests: 20, maxFailures: 10 });

function refuse(ip: string | null, status: number, body: Record<string, unknown>) {
  brake.noteFailure(ip);
  return NextResponse.json(body, { status });
}

const HOSTNAME = /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/** The site, as a bare hostname: whatever was pasted (a URL, a www. address, a
 *  trailing slash) comes back as `ucl.ac.uk`. supervisor-service reduces it to
 *  the registrable domain; this only refuses what cannot be a website. */
function siteDomain(value: unknown): string {
  let raw = text(value, "domain", 300, { required: true, label: "Website" }).toLowerCase();
  raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");
  if (raw.startsWith("www.")) raw = raw.slice(4);
  if (!HOSTNAME.test(raw)) {
    throw new InvalidInput("domain", "Please enter your website's address, like university.ac.uk.");
  }
  return raw;
}

/** The email must be at the site: `web@ucl.ac.uk` or `web@it.ucl.ac.uk` for
 *  ucl.ac.uk. The service checks the registrable domain again; this catches the
 *  plain mistake early with a message that says what to do. */
function emailAtSite(address: string, domain: string) {
  const at = address.slice(address.lastIndexOf("@") + 1);
  if (at !== domain && !at.endsWith(`.${domain}`) && !domain.endsWith(`.${at}`)) {
    throw new InvalidInput("email", `Please use an email address at ${domain}, so we can confirm the request is from your university.`);
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  try {
    if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return refuse(ip, 415, { error: "Unsupported content type." });
    }
    if (!originAllowed(req)) return refuse(ip, 403, { error: "Forbidden." });
    if (brake.limited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return refuse(ip, 413, { error: "That request was too large." });
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return refuse(ip, 400, { error: "Invalid request." });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return refuse(ip, 400, { error: "Invalid request." });
    if (honeypotTripped(body)) return refuse(ip, 400, { error: "Invalid request." });

    let domain: string;
    let address: string;
    let name: string;
    try {
      domain = siteDomain(body.domain);
      address = cleanEmail(body.email);
      emailAtSite(address, domain);
      name = text(body.name, "name", 80, { label: "Name" });
    } catch (e) {
      if (e instanceof InvalidInput) return refuse(ip, 400, { error: e.message, field: e.field });
      throw e;
    }

    const turnstileToken = body.turnstileToken;
    if (!isTurnstileDisabled() && (!turnstileToken || typeof turnstileToken !== "string" || turnstileToken.length > 2048)) {
      return refuse(ip, 400, { error: "Please complete the security check." });
    }
    let turnstileValid: boolean;
    try {
      turnstileValid = await verifyTurnstileToken(String(turnstileToken || ""), ip, TURNSTILE_SITE_BLOCK_ACTION);
    } catch (e) {
      console.error("turnstile unreachable:", e);
      return NextResponse.json({ error: "The security check is unavailable. Please try again." }, { status: 503 });
    }
    if (!turnstileValid) return refuse(ip, 403, { error: "Security check failed. Please try again." });

    if (!supervisorMock()) {
      let res: Response;
      try {
        res = await fetch(`${ALUTTA_API_URL}/v1/supervisors/site-block/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, email: address, name }),
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
        console.error("supervisor-service site block error:", res.status);
        return NextResponse.json({ error: "We could not send your request. Please try again, or write to hello@alutta.com." }, { status: 502 });
      }
    }

    // The same body whatever the service found. See the note at the top.
    return NextResponse.json({ success: true, domain }, { status: 202 });
  } catch (err) {
    console.error("Site block API error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

/** The route accepts a block request and nothing else. */
export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
