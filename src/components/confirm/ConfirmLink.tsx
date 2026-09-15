"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Check, Clock, Link2Off, Loader2 } from "lucide-react";

import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";

/** The page an emailed confirmation link lands on.
 *
 *  Two links use it: a researcher confirming their removal from Supervisor
 *  Finder, and a university web team confirming that AluttaBot should stop
 *  visiting their site. Both work the same way, so the rules live here once:
 *
 *   * the token rides in the URL fragment, which never leaves the browser (no
 *     request, server log or Referer carries it), and the page clears it from
 *     the address bar on arrival so it does not linger in history either;
 *   * nothing happens until the person presses the button, because university
 *     mail scanners open every link in an email, and a page that acted on load
 *     would act for them unasked;
 *   * the page says at once what state the link is in, as sign-in and
 *     verification pages everywhere do: a visit with no token, or one not shaped
 *     like ours, is "not valid" without asking anyone; a well-formed token is
 *     looked up with the door's CHECK route, which changes nothing (so a scanner
 *     calling it does no harm), and the page opens on "confirm", "already done",
 *     "expired" or "not valid". Only the button ever acts;
 *   * if the check cannot answer (we are unreachable, or it takes too long),
 *     the page offers the button anyway: confirming gives the same answers. */

type State = "ready" | "confirming" | "done" | "expired" | "invalid" | "error";

export type ConfirmCopy = {
  eyebrow: string;
  heading: string;
  /** The heading once the check has answered, when it can say more (the site
   *  block page names the website). Falls back to `heading`. */
  headingFor?: (data: Record<string, unknown>) => string | null;
  /** The body when the link was already used before this visit. */
  alreadyBody: (data: Record<string, unknown>) => string;
  body: string;
  button: string;
  quiet: string;
  doneEyebrow: string;
  doneHeading: string;
  /** Built from the service's answer (for example, the domain it blocked). */
  doneBody: (data: Record<string, unknown>) => string;
  askAgainHref: string;
  askAgainLabel: string;
};

/** Our tokens are URL-safe random strings, 20 to 200 characters (the route
 *  refuses anything else before calling the service). */
const TOKEN_SHAPE = /^[A-Za-z0-9_-]{20,200}$/;

function takeToken(): string {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = params.get("token") || "";
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname);
  }
  return token;
}

/** The token this page arrived with, read once per page and kept here, because
 *  the address bar is cleared the moment it is read. Keyed on the path so the
 *  two confirmation pages never share one. */
let arrival: { path: string; token: string } | null = null;

function arrivalToken(): string {
  const path = window.location.pathname;
  if (!arrival || arrival.path !== path) arrival = { path, token: takeToken() };
  return arrival.token;
}

const noSubscription = () => () => {};

/** "22 September 2026", or null for anything that is not a date. */
function readableDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

const CHECK_TIMEOUT_MS = 6_000;

export default function ConfirmLink({ endpoint, checkEndpoint, copy, successKey }: { endpoint: string; checkEndpoint: string; copy: ConfirmCopy; successKey: string }) {
  const [state, setState] = useState<State>("ready");
  const [error, setError] = useState<string | null>(null);
  const [doneBody, setDoneBody] = useState("");

  // Whether this visit brought a link at all. "checking" is the static HTML,
  // before the browser can read the fragment: the card keeps its size and shows
  // nothing, so a visit with no link never flashes a button it cannot use.
  const arrived = useSyncExternalStore(
    noSubscription,
    () => (TOKEN_SHAPE.test(arrivalToken()) ? "link" : "no-link"),
    () => "checking",
  );

  // The CHECK: once, for a link that looks like ours. Read-only on the
  // service's side, so calling it on arrival is safe. Until it answers the card
  // stays hidden, the same as before the fragment is read.
  const [checked, setChecked] = useState<"pending" | "answered">("pending");
  const [heading, setHeading] = useState(copy.heading);
  const [expiresOn, setExpiresOn] = useState<string | null>(null);
  const asked = useRef(false);
  useEffect(() => {
    if (arrived !== "link" || asked.current) return;
    asked.current = true;
    fetch(checkEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: arrivalToken() }),
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (res.status === 410) setState("expired");
        else if (res.status === 404) setState("invalid");
        else if (res.ok && data.status === "confirmed") {
          setDoneBody(copy.alreadyBody(data));
          setState("done");
        } else if (res.ok && data.status === "valid") {
          setHeading(copy.headingFor?.(data) || copy.heading);
          setExpiresOn(readableDate(data.expires_on));
        }
        // Anything else (unreachable, busy): offer the button, which answers the same way.
      })
      .catch(() => { /* timed out or offline: the button still works */ })
      .finally(() => setChecked("answered"));
  }, [arrived, checkEndpoint, copy]);

  const waiting = arrived === "checking" || (arrived === "link" && checked === "pending");
  const shown: State = state === "ready" && arrived === "no-link" ? "invalid" : state;

  const confirm = async () => {
    const token = arrivalToken();
    if (!TOKEN_SHAPE.test(token)) {
      setState("invalid");
      return;
    }
    setState("confirming");
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (res.ok && data[successKey]) {
        setDoneBody(copy.doneBody(data));
        setState("done");
        return;
      }
      if (res.status === 410) { setState("expired"); return; }
      if (res.status === 404) { setState("invalid"); return; }
      setError(typeof data.error === "string" ? data.error : "We could not confirm this right now. Please try again.");
      setState("error");
    } catch {
      setError("Connection error. Please check your internet and try again.");
      setState("error");
    }
  };

  return (
    <div className="atlas-home legal-home researchers-home">
      <HomeHeader />
      <section className="legal-container researchers-confirm" aria-labelledby="confirm-heading">
        <div
          className="researchers-remove-card researchers-confirm-card"
          aria-live="polite"
          aria-busy={waiting}
          style={waiting ? { visibility: "hidden" } : undefined}
        >
          {shown === "done" ? (
            <>
              <span className="researchers-sent-icon"><Check size={26} /></span>
              <span className="legal-eyebrow"><span /> {copy.doneEyebrow}</span>
              <h1 id="confirm-heading">{copy.doneHeading}</h1>
              <p>{doneBody}</p>
              <p className="researchers-confirm-quiet">Changed your mind, or have a question? Write to <a href="mailto:hello@alutta.com">hello@alutta.com</a>.</p>
            </>
          ) : shown === "expired" ? (
            <>
              <span className="researchers-sent-icon"><Clock size={26} /></span>
              <span className="legal-eyebrow"><span /> LINK EXPIRED</span>
              <h1 id="confirm-heading">This link has expired.</h1>
              <p>Confirmation links work for 7 days. Ask again and we will send you a new one.</p>
              <Link className="atlas-button" href={copy.askAgainHref}>{copy.askAgainLabel} <ArrowRight size={18} /></Link>
            </>
          ) : shown === "invalid" ? (
            <>
              <span className="researchers-sent-icon"><Link2Off size={26} /></span>
              <span className="legal-eyebrow"><span /> LINK NOT RECOGNISED</span>
              <h1 id="confirm-heading">This link is not valid.</h1>
              <p>It may have been cut short when it was copied. Open the link in your email again, or ask for a new one.</p>
              <Link className="atlas-button" href={copy.askAgainHref}>{copy.askAgainLabel} <ArrowRight size={18} /></Link>
            </>
          ) : (
            <>
              <span className="legal-eyebrow"><span /> {copy.eyebrow}</span>
              <h1 id="confirm-heading">{heading}</h1>
              <p>{copy.body}</p>
              {error && <p className="researchers-confirm-error" role="alert">{error}</p>}
              <button type="button" className="atlas-button" onClick={confirm} disabled={shown === "confirming" || arrived !== "link"}>
                {shown === "confirming" ? <><Loader2 size={18} className="animate-spin" /> Confirming</> : <>{copy.button} <ArrowRight size={18} /></>}
              </button>
              <p className="researchers-confirm-quiet">{expiresOn ? `This link works until ${expiresOn}. ` : ""}{copy.quiet}</p>
            </>
          )}
        </div>
      </section>
      <CareersFooter topId="confirm-heading" />
    </div>
  );
}
