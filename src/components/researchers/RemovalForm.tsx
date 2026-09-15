"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";

import { TURNSTILE_REMOVAL_ACTION, TURNSTILE_SCRIPT_URL } from "@/lib/turnstile";
import { cn } from "@/lib/utils";
import { HONEYPOT_FIELD } from "@/lib/waitlist-input";

/** The researcher removal request.
 *
 *  Three fields and a security check, because the service needs nothing else:
 *  the work email is what it matches on and where the confirmation goes, the
 *  name and profile link help staff when two people share a name. The form
 *  looks like the waitlist form on purpose (same fields, same states) so the
 *  site has one way of asking for something, not two.
 *
 *  The success state says the same thing to everyone. Whether the address
 *  belongs to someone in the directory is never shown here, so the form cannot
 *  be used to find out who is listed. */
export default function RemovalForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [touched, setTouched] = useState({ name: false, email: false, profileUrl: false });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  // Local work only, and inlined at build time: a production build renders the
  // widget whatever the variable says, the same rule the route applies.
  const turnstileDisabled = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === "true";

  useEffect(() => {
    if (turnstileDisabled || !turnstileLoaded || !turnstileRef.current || !siteKey || widgetId.current) return;
    widgetId.current = window.turnstile?.render(turnstileRef.current, {
      sitekey: siteKey,
      action: TURNSTILE_REMOVAL_ACTION,
      callback: (token) => { setTurnstileToken(token); setTurnstileError(null); },
      "expired-callback": () => { setTurnstileToken(""); setTurnstileError("Security check expired. Please verify again."); },
      "error-callback": () => { setTurnstileToken(""); setTurnstileError("Security check failed to load. Please refresh and try again."); },
      "timeout-callback": () => { setTurnstileToken(""); setTurnstileError("The security check timed out. Please try again."); },
    }) ?? null;
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [turnstileDisabled, turnstileLoaded, siteKey]);

  // The server's rules, checked early so a mistake is caught before the
  // security check is spent on it (lib/waitlist-input.ts is the authority).
  const nameValid = name.trim().length >= 2 && /^[\p{L}\p{M}][\p{L}\p{M}\s'’\-.]*$/u.test(name.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const profileValid = !profileUrl.trim() || /^https?:\/\/\S+\.\S+/i.test(profileUrl.trim());
  const turnstileReady = turnstileDisabled || (!!turnstileToken && !!siteKey);
  const canSubmit = nameValid && emailValid && profileValid && turnstileReady && !submitting;

  const resetTurnstile = () => {
    setTurnstileToken("");
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, email: true, profileUrl: true });
    if (!nameValid || !emailValid || !profileValid) return;
    if (!turnstileDisabled && !siteKey) { setError("Security check is not configured. Please try again later."); return; }
    if (!turnstileDisabled && !turnstileToken) { setTurnstileError("Please complete the security check."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/researchers/removal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          profileUrl: profileUrl.trim(),
          [HONEYPOT_FIELD]: honeypot,
          turnstileToken: turnstileDisabled ? "local-bypass" : turnstileToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        resetTurnstile();
        return;
      }
      setSent(true);
    } catch {
      setError("Connection error. Please check your internet and try again.");
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) => cn(
    "w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-colors text-brand-dark placeholder:text-gray-400",
    hasError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-brand-accent",
  );

  if (sent) {
    return (
      <div className="researchers-sent" role="status" aria-live="polite">
        <span className="researchers-sent-icon"><Check size={26} /></span>
        <h3>Check your university inbox.</h3>
        <p>If this address belongs to a researcher in our directory, we have sent a link to it. Open the link within 7 days to confirm, and you will be removed.</p>
        <p>Nothing arrived? Check your spam folder, or write to <a href="mailto:hello@alutta.com">hello@alutta.com</a>.</p>
      </div>
    );
  }

  const nameError = touched.name && name.length > 0 && !nameValid;
  const emailError = touched.email && email.length > 0 && !emailValid;
  const profileError = touched.profileUrl && !profileValid;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {!turnstileDisabled && (
        <Script src={TURNSTILE_SCRIPT_URL} strategy="afterInteractive" onReady={() => setTurnstileLoaded(true)} />
      )}

      <div>
        <label htmlFor="removal-name" className="block text-sm font-medium text-brand-dark mb-1.5">Full name</label>
        <input
          id="removal-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          placeholder="Adaeze Okonkwo"
          disabled={submitting}
          className={inputClass(nameError)}
          autoComplete="name"
        />
        {nameError && <p className="mt-1 text-xs text-red-500">Please enter your name using letters only.</p>}
      </div>

      <div>
        <label htmlFor="removal-email" className="block text-sm font-medium text-brand-dark mb-1.5">Work email</label>
        <input
          id="removal-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="a.okonkwo@university.ac.uk"
          disabled={submitting}
          className={inputClass(emailError)}
          autoComplete="email"
          aria-describedby="removal-email-hint"
        />
        {emailError
          ? <p className="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
          : <p id="removal-email-hint" className="mt-1 text-xs text-gray-500">The address at your university. The confirmation link goes there.</p>}
      </div>

      <div>
        <label htmlFor="removal-profile" className="block text-sm font-medium text-brand-dark mb-1.5">Your profile page <span className="font-normal text-gray-400">(optional)</span></label>
        <input
          id="removal-profile"
          type="url"
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, profileUrl: true }))}
          placeholder="https://"
          disabled={submitting}
          className={inputClass(profileError)}
          autoComplete="url"
          spellCheck={false}
        />
        {profileError && <p className="mt-1 text-xs text-red-500">Please enter a full link, starting with https://.</p>}
      </div>

      {/* The honeypot: off screen, unlabelled for people, skipped by the tab
          order and by autofill. A script that fills every input fills it. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor={`${HONEYPOT_FIELD}-removal`}>Website</label>
        <input id={`${HONEYPOT_FIELD}-removal`} type="text" name={HONEYPOT_FIELD} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100" role="alert">{error}</p>}

      {!turnstileDisabled && (
        <div className="min-h-[65px]">
          {siteKey ? <div ref={turnstileRef} /> : <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">Security check is not configured.</p>}
          {turnstileError && <p className="mt-1 text-xs text-red-500">{turnstileError}</p>}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          "w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-base",
          canSubmit ? "bg-brand-accent text-white hover:bg-brand-accent/90 shadow-sm hover:shadow-md" : "bg-gray-100 text-gray-400 cursor-not-allowed",
        )}
      >
        {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Sending...</> : <>Send the confirmation link<ArrowRight className="w-5 h-5" /></>}
      </button>

      <p className="researchers-form-note"><ShieldCheck size={16} aria-hidden="true" />We use this only to act on your request. Read our <a href="/privacy">Privacy Policy</a>.</p>
    </form>
  );
}
