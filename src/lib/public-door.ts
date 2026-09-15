/** The checks every public write path on this site carries.
 *
 *  The site has two doors a stranger can write through: the waitlist and the
 *  researcher removal request. Both need the same four things, in the same
 *  order, and a second hand-copied version of any of them is the one that
 *  drifts: the client address, the same-origin rule, a per-IP brake, and
 *  Turnstile verified server-side and pinned to the form's own action. They
 *  live here once, and each route supplies only what is different about it.
 *
 *  Server-only: the Turnstile secret is read here. */

import type { NextRequest } from "next/server";

import { SITE_URL } from "@/lib/site";

/** How long we wait on an upstream call (Turnstile, the gateway). A stuck
 *  upstream must fail the one request, not hold a serverless worker open. */
export const UPSTREAM_TIMEOUT_MS = 8_000;

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

/** The local bypass. Never honoured by a production build, whatever the env
 *  says, so a stray flag in a deploy cannot open a door. */
export function isTurnstileDisabled() {
  return !isProduction() && process.env.TURNSTILE_DISABLED === "true";
}

/** Hostnames a Turnstile token may have been solved on. Production is the
 *  apex and www; a Vercel preview has its own generated hostname, which is on
 *  the Turnstile site key already, so the check is skipped there rather than
 *  every preview needing an override. */
const TURNSTILE_HOSTNAMES = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || "alutta.com,www.alutta.com")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

type SiteVerify = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

/** Verify a token for ONE form.
 *
 *  Cloudflare echoes the action the widget was rendered with and the hostname
 *  it was solved on; a token solved elsewhere, for something else, is refused
 *  even though it is genuine. Both checks bind only in a production build:
 *  Cloudflare's "always passes" test keys echo neither a real action nor a
 *  real hostname, so in development a mismatch is logged and let through.
 *
 *  Throws when Turnstile cannot be asked; returns false when it says no. */
export async function verifyTurnstileToken(token: string, remoteIp: string | null, action: string): Promise<boolean> {
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

  const hostname = (result.hostname || "").toLowerCase();
  const preview = process.env.VERCEL_ENV === "preview";
  if (result.action !== action) {
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
 *  bots, and the service behind the gateway throttles on its own side. This
 *  exists so one client cannot hammer *a route*, including the outbound
 *  Turnstile call it makes on every attempt.
 *
 *  THE LIMITS ARE GENEROUS ON PURPOSE. This audience shares addresses (a
 *  cybercafe, a university lab, a whole mobile network behind carrier NAT), so
 *  a tight per-IP cap locks out exactly the people we are trying to reach, and
 *  it does it silently. What an attacker produces that a shared network does
 *  not is a stream of REJECTED requests, so failures are budgeted far more
 *  tightly than successes.
 *
 *  Two honest limitations: a serverless deployment runs many instances, each
 *  with its own memory; and the client address comes from a header, which is
 *  trustworthy behind Vercel or Cloudflare and spoofable if the origin is
 *  reached directly. Both are why this is a brake and Turnstile is the gate.
 *
 *  One brake per route, so probing one door does not spend the other's budget. */
export function createBrake({ windowMs, maxRequests, maxFailures }: { windowMs: number; maxRequests: number; maxFailures: number }) {
  type Bucket = { all: number[]; bad: number[] };
  const hits = new Map<string, Bucket>();

  function bucketFor(ip: string, now: number): Bucket {
    const b = hits.get(ip) ?? { all: [], bad: [] };
    b.all = b.all.filter((t) => now - t < windowMs);
    b.bad = b.bad.filter((t) => now - t < windowMs);
    hits.set(ip, b);
    return b;
  }

  return {
    /** Count this request, and say whether the address is over budget. */
    limited(ip: string | null): boolean {
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
      return b.all.length > maxRequests || b.bad.length > maxFailures;
    },
    /** Record a rejected attempt. Probing costs an address its budget; a
     *  request that goes through does not. */
    noteFailure(ip: string | null) {
      if (!ip) return;
      const now = Date.now();
      bucketFor(ip, now).bad.push(now);
    },
  };
}

/** The client address. Vercel and Cloudflare each set their own header from
 *  the connection they terminated; the first hop of x-forwarded-for is the
 *  general case. */
export function clientIp(req: NextRequest): string | null {
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
 *  forces a preflight these routes never answer), so this is defence in depth
 *  against a misconfigured proxy, and it costs nothing. A request with no
 *  Origin at all (a script, curl, an old browser) passes through to Turnstile,
 *  which is the gate that actually decides. */
export function originAllowed(req: NextRequest): boolean {
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
