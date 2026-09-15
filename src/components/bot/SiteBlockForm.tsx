"use client";

import Script from "next/script";
import { useState } from "react";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";

import { TURNSTILE_SCRIPT_URL, TURNSTILE_SITE_BLOCK_ACTION } from "@/lib/turnstile";
import { useTurnstile } from "@/lib/use-turnstile";
import { cn } from "@/lib/utils";
import { HONEYPOT_FIELD } from "@/lib/waitlist-input";

/** "Stop AluttaBot visiting our site", for a university's web team.
 *
 *  The website and an email address AT that website: the confirmation goes to
 *  that inbox, which is what proves the request comes from the university. The
 *  form has the removal form's fields, states and skin, so the site asks for
 *  things one way.
 *
 *  The success state says the same thing whatever we hold: whether AluttaBot
 *  visits a site is never revealed here. */

/** What was typed, as the bare hostname the route will compare against. */
function hostOf(value: string): string {
  let raw = value.trim().toLowerCase().replace(/^[a-z][a-z0-9+.-]*:\/\//, "").split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");
  if (raw.startsWith("www.")) raw = raw.slice(4);
  return raw;
}

export default function SiteBlockForm() {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [touched, setTouched] = useState({ domain: false, email: false });
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const turnstile = useTurnstile(TURNSTILE_SITE_BLOCK_ACTION);

  const host = hostOf(domain);
  const domainValid = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host);
  const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const at = email.trim().toLowerCase().split("@")[1] || "";
  const emailAtSite = emailShape && domainValid && (at === host || at.endsWith(`.${host}`) || host.endsWith(`.${at}`));
  const canSubmit = domainValid && emailAtSite && turnstile.ready && !submitting;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ domain: true, email: true });
    if (!domainValid || !emailAtSite) return;
    if (!turnstile.disabled && !turnstile.siteKey) { setError("Security check is not configured. Please try again later."); return; }
    if (!turnstile.ready) { turnstile.setError("Please complete the security check."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bot/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: host,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          [HONEYPOT_FIELD]: honeypot,
          turnstileToken: turnstile.submitToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        turnstile.reset();
        return;
      }
      setSentTo(email.trim().toLowerCase());
    } catch {
      setError("Connection error. Please check your internet and try again.");
      turnstile.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) => cn(
    "w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-colors text-brand-dark placeholder:text-gray-400",
    hasError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-brand-accent",
  );

  if (sentTo) {
    return (
      <div className="researchers-sent" role="status" aria-live="polite">
        <span className="researchers-sent-icon"><Check size={26} /></span>
        <h3>Check your inbox.</h3>
        <p>If AluttaBot visits {host}, we have sent a link to {sentTo}. Open it within 7 days to confirm, and AluttaBot will stop visiting the site.</p>
        <p>Nothing arrived? Check your spam folder, or write to <a href="mailto:hello@alutta.com?subject=AluttaBot">hello@alutta.com</a>.</p>
      </div>
    );
  }

  const domainError = touched.domain && domain.length > 0 && !domainValid;
  const emailError = touched.email && email.length > 0 && !emailShape;
  const emailNotAtSite = touched.email && emailShape && domainValid && !emailAtSite;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {!turnstile.disabled && (
        <Script src={TURNSTILE_SCRIPT_URL} strategy="afterInteractive" onReady={turnstile.onScriptReady} />
      )}

      <div>
        <label htmlFor="block-domain" className="block text-sm font-medium text-brand-dark mb-1.5">Your university’s website</label>
        <input
          id="block-domain"
          type="text"
          inputMode="url"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, domain: true }))}
          placeholder="university.ac.uk"
          disabled={submitting}
          className={inputClass(domainError)}
          autoComplete="url"
          spellCheck={false}
        />
        {domainError && <p className="mt-1 text-xs text-red-500">Please enter your website’s address, like university.ac.uk.</p>}
      </div>

      <div>
        <label htmlFor="block-email" className="block text-sm font-medium text-brand-dark mb-1.5">Your work email</label>
        <input
          id="block-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder={domainValid ? `webmaster@${host}` : "webmaster@university.ac.uk"}
          disabled={submitting}
          className={inputClass(emailError || emailNotAtSite)}
          autoComplete="email"
          aria-describedby="block-email-hint"
        />
        {emailError
          ? <p className="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
          : emailNotAtSite
            ? <p className="mt-1 text-xs text-red-500">Please use an address at {host}, so we can confirm the request is from your university.</p>
            : <p id="block-email-hint" className="mt-1 text-xs text-gray-500">An address at the same website. The confirmation link goes there.</p>}
      </div>

      <div>
        <label htmlFor="block-name" className="block text-sm font-medium text-brand-dark mb-1.5">Your name <span className="font-normal text-gray-400">(optional)</span></label>
        <input
          id="block-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Web team"
          disabled={submitting}
          className={inputClass(false)}
          autoComplete="name"
        />
      </div>

      {/* The honeypot: off screen, skipped by the tab order and by autofill. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor={`${HONEYPOT_FIELD}-block`}>Website</label>
        <input id={`${HONEYPOT_FIELD}-block`} type="text" name={HONEYPOT_FIELD} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100" role="alert">{error}</p>}

      {!turnstile.disabled && (
        <div className="min-h-[65px]">
          {turnstile.siteKey ? <div ref={turnstile.ref} /> : <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">Security check is not configured.</p>}
          {turnstile.error && <p className="mt-1 text-xs text-red-500">{turnstile.error}</p>}
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
