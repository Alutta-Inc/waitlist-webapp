"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowRight, Check, Copy, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FormVariant = "hero" | "cta";

interface WaitlistFormProps {
  variant?: FormVariant;
  source?: string;
}

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("utm_source"),
    medium: p.get("utm_medium"),
    campaign: p.get("utm_campaign"),
  };
}

function getReferralCode() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("ref");
}

export default function WaitlistForm({ variant = "hero", source = "hero" }: WaitlistFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ referralCode: string; alreadySignedUp?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-fill from URL if user lands from a referral
  const [referredBy, setReferredBy] = useState<string | null>(null);
  useEffect(() => {
    setReferredBy(getReferralCode());
  }, []);

  // Validation
  const firstNameValid = firstName.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(firstName.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValid = firstNameValid && emailValid;

  const showFirstNameError = firstNameTouched && firstName.length > 0 && !firstNameValid;
  const showEmailError = emailTouched && email.length > 0 && !emailValid;

  const referralLink = submitted
    ? `${typeof window !== "undefined" ? window.location.origin : "https://alutta.com"}?ref=${submitted.referralCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join me on Alutta",
        text: "I just joined the Alutta waitlist — the platform for international students. Join using my link:",
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstNameTouched(true);
    setEmailTouched(true);
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim().toLowerCase(),
          referredBy,
          source,
          utm: getUtmParams(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted({
        referralCode: data.referralCode,
        alreadySignedUp: data.alreadySignedUp,
      });
    } catch {
      setError("Connection error. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className={cn("animate-fade-in", variant === "hero" ? "bg-white rounded-2xl p-8 shadow-lg" : "")}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-display font-medium text-2xl text-brand-dark mb-1">
            {submitted.alreadySignedUp ? "You're already on the list!" : "You're on the list! 🎉"}
          </h3>
          {!submitted.alreadySignedUp && (
            <p className="text-gray-500 text-sm">
              You&apos;re in. Check your inbox for a confirmation email.
            </p>
          )}
        </div>

        {/* Referral section */}
        <div className="bg-brand-bg border border-brand-accent/20 rounded-xl p-5">
          <p className="text-sm font-semibold text-brand-dark mb-1">Share your early access link</p>
          <p className="text-xs text-gray-500 mb-3">Invite friends who are also planning to study abroad.</p>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3">
            <span className="text-xs text-gray-600 truncate flex-1">{referralLink}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 bg-brand-dark text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark/90 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 bg-brand-accent text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-brand-accent/90 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────
  const inputClass = (hasError: boolean) => cn(
    "w-full px-4 py-3 rounded-xl border-2 bg-white focus:outline-none transition-colors text-brand-dark placeholder:text-gray-400",
    hasError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-brand-accent"
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {variant === "cta" && (
        <>
          <h3 className="font-display font-medium text-xl lg:text-2xl text-brand-dark mb-1">
            Join the Waitlist
          </h3>
          <p className="text-gray-500 text-sm mb-4">Be the first to know when we launch.</p>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1.5">First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => setFirstNameTouched(true)}
          placeholder="Emeka"
          disabled={isSubmitting}
          className={inputClass(!!showFirstNameError)}
          autoComplete="given-name"
        />
        {showFirstNameError && (
          <p className="mt-1 text-xs text-red-500">Please enter your first name (letters only)</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1.5">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="emeka@gmail.com"
          disabled={isSubmitting}
          className={inputClass(!!showEmailError)}
          autoComplete="email"
        />
        {showEmailError && (
          <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={cn(
          "w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-base",
          isValid && !isSubmitting
            ? "bg-brand-accent text-white hover:bg-brand-accent/90 shadow-sm hover:shadow-md"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        {isSubmitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" />Joining...</>
        ) : (
          <>Join the Waitlist<ArrowRight className="w-5 h-5" /></>
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        No spam, ever. Unsubscribe anytime.
        {referredBy && <span className="block mt-1 text-brand-accent">✓ Referred by a friend</span>}
      </p>
    </form>
  );
}
