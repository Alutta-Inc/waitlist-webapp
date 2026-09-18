/** An invitation somebody was sent, and whether it is real.
 *
 *  A referral arrives as `?ref=CODE` on whatever page the inviter's link
 *  opened. Three things have to happen for that to be worth anything, and
 *  none of them used to:
 *
 *   1. IT HAS TO SURVIVE THE NEXT CLICK. The link lands on a page; the form
 *      is usually somewhere else. Reading the code off `window.location`
 *      only works if the visitor joins from that exact page load, so a code
 *      seen once is remembered here and read back wherever the form is.
 *   2. IT HAS TO BE SAID OUT LOUD. An invitation that changes nothing on
 *      screen is indistinguishable from a plain link, and the person who
 *      sent it is never credited in front of the person who received it.
 *   3. IT HAS TO BE TYPEABLE. Codes get read out, screenshotted and pasted
 *      into chats without their URL, so the form takes one by hand as well.
 *
 *  WHAT IS REMEMBERED, AND FOR HOW LONG. The code only: eight characters of
 *  attribution, in this browser, for thirty days. Not who sent it, not their
 *  name, nothing about the visitor. It is dropped the moment they join, so
 *  the code they are then given to share is never confused with the one they
 *  arrived on.
 */

/** A code we issued. Ours are alphanumeric; nothing else is one. The same
 *  shape the waitlist route enforces server-side (`REFERRAL` there). */
export const REFERRAL_SHAPE = /^[A-Z0-9]{4,16}$/;

const STORAGE_KEY = "alutta_ref";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** What we know about a code: nothing yet, looking, real, or not ours. */
export type ReferralStatus = "none" | "checking" | "valid" | "invalid" | "unverified";

export type Referral = {
  code: string;
  status: ReferralStatus;
  /** The inviter's first name, and only when the code is real. */
  referrerName: string;
};

export const NO_REFERRAL: Referral = { code: "", status: "none", referrerName: "" };

/** Tidy what a person typed or pasted into the shape a code has. */
export function normaliseCode(raw: string): string {
  return (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
}

export function isCodeShaped(raw: string): boolean {
  return REFERRAL_SHAPE.test(normaliseCode(raw));
}

/** The code in the current URL, if it is one of ours. */
export function codeInUrl(): string {
  if (typeof window === "undefined") return "";
  const raw = normaliseCode(new URLSearchParams(window.location.search).get("ref") || "");
  return REFERRAL_SHAPE.test(raw) ? raw : "";
}

function storedCode(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "";
    const saved = JSON.parse(raw) as { code?: unknown; at?: unknown };
    const code = normaliseCode(String(saved.code || ""));
    const at = Number(saved.at);
    if (!REFERRAL_SHAPE.test(code)) return "";
    if (!Number.isFinite(at) || Date.now() - at > MAX_AGE_MS) {
      forgetCode();
      return "";
    }
    return code;
  } catch {
    // Storage blocked, or something else wrote to the key. An invitation is
    // never worth throwing over.
    return "";
  }
}

export function rememberCode(code: string): void {
  const value = normaliseCode(code);
  if (!REFERRAL_SHAPE.test(value)) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: value, at: Date.now() }));
  } catch {
    /* the visit still works, the code just does not outlive it */
  }
}

export function forgetCode(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do */
  }
}

/** The code in play: this URL's, else the one this browser is carrying.
 *
 *  Seeing one in the URL also writes it down, so the rest of the visit keeps
 *  it. A fresh `?ref=` wins over a remembered one: the link they just opened
 *  is the invitation they are acting on. */
export function currentCode(): string {
  const fromUrl = codeInUrl();
  if (fromUrl) {
    rememberCode(fromUrl);
    return fromUrl;
  }
  return storedCode();
}

// ── Whose code is it ──────────────────────────────────────────────────────

/** Answers already had, so a banner and the form below it do not each ask.
 *  Module-level, so it lasts as long as the page does and no longer. */
const answers = new Map<string, Promise<Referral>>();

async function ask(code: string): Promise<Referral> {
  try {
    const res = await fetch(`/api/referral?code=${encodeURIComponent(code)}`);
    if (!res.ok) return { code, status: "unverified", referrerName: "" };
    const data = (await res.json()) as { valid?: boolean | null; referrerFirstName?: string };
    if (data.valid === true) {
      return { code, status: "valid", referrerName: String(data.referrerFirstName || "") };
    }
    if (data.valid === false) return { code, status: "invalid", referrerName: "" };
    // `null` is the service being unreachable, which is not the same as a bad
    // code: the signup carries it anyway and customer-service checks again.
    return { code, status: "unverified", referrerName: "" };
  } catch {
    return { code, status: "unverified", referrerName: "" };
  }
}

/** Whose code this is. Asked once per code per page. */
export function resolveCode(code: string): Promise<Referral> {
  const value = normaliseCode(code);
  if (!REFERRAL_SHAPE.test(value)) return Promise.resolve(NO_REFERRAL);
  let answer = answers.get(value);
  if (!answer) {
    answer = ask(value);
    answers.set(value, answer);
  }
  return answer;
}
