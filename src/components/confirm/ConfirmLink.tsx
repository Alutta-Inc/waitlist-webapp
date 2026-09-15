"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
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
 *   * a visit with no token, or one that is not shaped like ours, says at once
 *     that the link is not valid, as sign-in and verification pages everywhere
 *     do, instead of offering a button that can only fail. Whether a well-formed
 *     token has expired is only known once it is sent, so that answer waits for
 *     the button;
 *   * the answer is one of four states: confirmed, expired, not valid, or a
 *     failure to reach us, which offers the button again. */

type State = "ready" | "confirming" | "done" | "expired" | "invalid" | "error";

export type ConfirmCopy = {
  eyebrow: string;
  heading: string;
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

export default function ConfirmLink({ endpoint, copy, successKey }: { endpoint: string; copy: ConfirmCopy; successKey: string }) {
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
          aria-busy={arrived === "checking"}
          style={arrived === "checking" ? { visibility: "hidden" } : undefined}
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
              <h1 id="confirm-heading">{copy.heading}</h1>
              <p>{copy.body}</p>
              {error && <p className="researchers-confirm-error" role="alert">{error}</p>}
              <button type="button" className="atlas-button" onClick={confirm} disabled={shown === "confirming" || arrived !== "link"}>
                {shown === "confirming" ? <><Loader2 size={18} className="animate-spin" /> Confirming</> : <>{copy.button} <ArrowRight size={18} /></>}
              </button>
              <p className="researchers-confirm-quiet">{copy.quiet}</p>
            </>
          )}
        </div>
      </section>
      <CareersFooter topId="confirm-heading" />
    </div>
  );
}
