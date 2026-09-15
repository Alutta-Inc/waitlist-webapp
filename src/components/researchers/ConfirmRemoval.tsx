"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Clock, Link2Off, Loader2 } from "lucide-react";

import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";

type State = "ready" | "confirming" | "removed" | "expired" | "invalid" | "error";

/** Read the token from the fragment, then take it out of the address bar.
 *
 *  The fragment never leaves the browser (not in a request, a server log or a
 *  Referer), and clearing it at once means it does not linger in history, a
 *  bookmark or a shared screenshot either. */
function takeToken(): string {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const token = params.get("token") || "";
  if (window.location.hash) {
    window.history.replaceState(null, "", window.location.pathname);
  }
  return token;
}

/** /researchers/confirm: where the removal email's link lands.
 *
 *  Nothing happens on arrival. The researcher presses one button, and only that
 *  sends the token, because university mail scanners open every link in an
 *  email and a page that acted on load would remove people unasked. */
export default function ConfirmRemoval() {
  const [state, setState] = useState<State>("ready");
  const [error, setError] = useState<string | null>(null);

  // The token lives in a ref, not state: it is read once on arrival and the
  // address bar is cleared, and nothing on screen depends on it until the
  // button is pressed. Once only, because React runs effects twice in
  // development and a second read would find the fragment already gone.
  const token = useRef<string | null>(null);
  useEffect(() => {
    if (token.current !== null) return;
    token.current = takeToken();
  }, []);

  const confirm = async () => {
    if (!token.current) {
      setState("invalid");
      return;
    }
    setState("confirming");
    setError(null);
    try {
      const res = await fetch("/api/researchers/removal/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.removed) { setState("removed"); return; }
      if (res.status === 410) { setState("expired"); return; }
      if (res.status === 404) { setState("invalid"); return; }
      setError(data.error || "We could not confirm this right now. Please try again.");
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
        <div className="researchers-remove-card researchers-confirm-card" aria-live="polite">
          {state === "removed" ? (
            <>
              <span className="researchers-sent-icon"><Check size={26} /></span>
              <span className="legal-eyebrow"><span /> REMOVAL CONFIRMED</span>
              <h1 id="confirm-heading">You have been removed.</h1>
              <p>Students no longer see you in Supervisor Finder, and we will not list you again. You do not need to do anything else.</p>
              <p className="researchers-confirm-quiet">Changed your mind, or have a question? Write to <a href="mailto:hello@alutta.com">hello@alutta.com</a>.</p>
            </>
          ) : state === "expired" ? (
            <>
              <span className="researchers-sent-icon"><Clock size={26} /></span>
              <span className="legal-eyebrow"><span /> LINK EXPIRED</span>
              <h1 id="confirm-heading">This link has expired.</h1>
              <p>Confirmation links work for 7 days. Ask again and we will send you a new one.</p>
              <Link className="atlas-button" href="/researchers#remove">Ask to be removed <ArrowRight size={18} /></Link>
            </>
          ) : state === "invalid" ? (
            <>
              <span className="researchers-sent-icon"><Link2Off size={26} /></span>
              <span className="legal-eyebrow"><span /> LINK NOT RECOGNISED</span>
              <h1 id="confirm-heading">This link is not valid.</h1>
              <p>It may have been cut short when it was copied. Open the link in your email again, or ask for a new one.</p>
              <Link className="atlas-button" href="/researchers#remove">Ask to be removed <ArrowRight size={18} /></Link>
            </>
          ) : (
            <>
              <span className="legal-eyebrow"><span /> SUPERVISOR FINDER</span>
              <h1 id="confirm-heading">Confirm your removal.</h1>
              <p>Once you confirm, students will no longer see you in Supervisor Finder, and we will not list you again.</p>
              {error && <p className="researchers-confirm-error" role="alert">{error}</p>}
              <button
                type="button"
                className="atlas-button"
                onClick={confirm}
                disabled={state !== "ready" && state !== "error"}
              >
                {state === "confirming" ? <><Loader2 size={18} className="animate-spin" /> Confirming</> : <>Remove me from Supervisor Finder <ArrowRight size={18} /></>}
              </button>
              <p className="researchers-confirm-quiet">Did not ask for this? Close this page and nothing will change.</p>
            </>
          )}
        </div>
      </section>
      <CareersFooter topId="confirm-heading" />
    </div>
  );
}
