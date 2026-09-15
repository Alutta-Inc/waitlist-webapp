// Alutta's own lightweight, self-hosted analytics tracker. No third-party script,
// no cookies for cross-site tracking, no per-event fees — events go to our
// analytics-service ingest endpoint through the API gateway.
//
// It sends `text/plain` (a CORS-safelisted content type) so there is no preflight
// round-trip, and prefers `sendBeacon` so an event still lands as the page unloads.

const ENDPOINT =
  (process.env.NEXT_PUBLIC_ANALYTICS_URL || "https://api.alutta.com") + "/v1/analytics/collect/";

const ANON_KEY = "alutta_anon";
const SESSION_KEY = "alutta_session";

type EventType = "page" | "track" | "identify";

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// A stable per-device id (localStorage) and a per-tab-session id (sessionStorage).
// Both degrade to a throwaway value if storage is blocked, so tracking never throws.
function anonymousId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "session";
  }
}

/** A URL as analytics may keep it: no fragment, and no `token` parameter.
 *
 *  Some links carry a secret (the researcher removal confirmation link has its
 *  token in the fragment), and a pageview must never copy one into the
 *  analytics store. The fragment is never needed for a pageview; `token` is
 *  dropped from the query too, in case a link ever puts one there. */
export function analyticsSafeUrl(raw: string): string {
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.hash = "";
    url.searchParams.delete("token");
    return url.toString();
  } catch {
    return "";
  }
}

function emit(type: EventType, extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = {
    events: [
      {
        type,
        url: analyticsSafeUrl(window.location.href),
        referrer: analyticsSafeUrl(document.referrer || ""),
        anonymous_id: anonymousId(),
        session_id: sessionId(),
        ts: Date.now(),
        ...extra,
      },
    ],
  };
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }));
    } else {
      void fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body,
        keepalive: true,
        mode: "cors",
      });
    }
  } catch {
    /* analytics must never break the page */
  }
}

/** A pageview for the current URL. */
export function page() {
  emit("page", { name: "Pageview" });
}

/** A named custom event — matches an event tag's `key` in the workspace. */
export function track(name: string, properties?: Record<string, unknown>) {
  if (name) emit("track", { name, properties: properties ?? {} });
}

/** Tie this device to a known user id (once they sign up / log in). */
export function identify(userId: string) {
  if (userId) emit("identify", { name: "identify", user_id: userId });
}
