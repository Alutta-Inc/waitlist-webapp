"use client";

import Script from "next/script";
import { useState, useEffect, useId, useMemo, useRef } from "react";
import { Loader2, ArrowRight, Check, Copy, Share2, Search, ChevronDown } from "lucide-react";
import { destinationCountries, sourceCountries } from "@/lib/journey-data";
import { cn } from "@/lib/utils";

type FormVariant = "hero" | "cta";
type TurnstileWidgetId = string;

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        }
      ) => TurnstileWidgetId;
      remove: (widgetId: TurnstileWidgetId) => void;
      reset: (widgetId: TurnstileWidgetId) => void;
    };
  }
}

interface WaitlistFormProps {
  variant?: FormVariant;
  source?: string;
}

type CountryChoice = {
  code: string;
  name: string;
};

interface SearchableCountryFieldProps {
  label: string;
  value: string;
  options: CountryChoice[];
  placeholder: string;
  hasError: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

function SearchableCountryField({
  label,
  value,
  options,
  placeholder,
  hasError,
  disabled,
  onChange,
  onBlur,
}: SearchableCountryFieldProps) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options.slice(0, 8);
    return options
      .filter((option) => option.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [options, query]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-brand-dark mb-1.5">{label}</label>
      <div
        className={cn(
          "relative rounded-xl border-2 bg-white transition-all",
          open && "shadow-lg shadow-brand-dark/5",
          hasError ? "border-red-300 focus-within:border-red-400" : "border-gray-200 focus-within:border-brand-accent"
        )}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={open ? query : value}
          onFocus={() => {
            setOpen(true);
            setQuery(value);
          }}
          onBlur={() => {
            setOpen(false);
            setQuery("");
            onBlur();
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            if (value) onChange("");
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-xl bg-transparent px-10 py-3 text-brand-dark outline-none placeholder:text-gray-400"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-brand-dark/10"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {visibleOptions.length > 0 ? (
              visibleOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  role="option"
                  aria-selected={value === option.name}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(option.name);
                    setQuery(option.name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-brand-accent/10",
                    value === option.name ? "bg-brand-accent/10 text-brand-dark" : "text-gray-600"
                  )}
                >
                  <span>{option.name}</span>
                  {value === option.name && <Check className="h-4 w-4 text-brand-accent" />}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-400">No matching country found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
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

function getLocaleCountryName() {
  if (typeof navigator === "undefined") return null;

  for (const language of navigator.languages ?? [navigator.language]) {
    try {
      const region = new Intl.Locale(language).region;
      const country = sourceCountries.find((option) => option.code === region?.toUpperCase());
      if (country) return country.name;
    } catch {
      // Ignore malformed browser locale strings.
    }
  }

  return null;
}

export default function WaitlistForm({ variant = "hero", source = "hero" }: WaitlistFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ referralCode: string; alreadySignedUp?: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [countryTouched, setCountryTouched] = useState(false);
  const [destinationTouched, setDestinationTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<TurnstileWidgetId | null>(null);
  const countryManuallyChanged = useRef(false);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileDisabled = process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === "true";

  // Pre-fill from URL if user lands from a referral
  const [referredBy, setReferredBy] = useState<string | null>(null);
  useEffect(() => {
    setReferredBy(getReferralCode());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const detectCountry = async () => {
      const applyCountry = (countryName: string | null) => {
        if (!countryName || !isMounted || countryManuallyChanged.current) return;
        setCountry((currentCountry) => currentCountry || countryName);
      };

      try {
        const response = await fetch("/api/geo", { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as { countryName?: string | null };
          if (data.countryName) {
            applyCountry(data.countryName);
            return;
          }
        }
      } catch {
        // Locale fallback below covers local/dev cases where geo headers are not available.
      }

      applyCountry(getLocaleCountryName());
    };

    detectCountry();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (turnstileDisabled || !turnstileLoaded || !turnstileRef.current || !turnstileSiteKey || turnstileWidgetId.current) {
      return;
    }

    turnstileWidgetId.current = window.turnstile?.render(turnstileRef.current, {
      sitekey: turnstileSiteKey,
      callback: (token) => {
        setTurnstileToken(token);
        setTurnstileError(null);
      },
      "expired-callback": () => {
        setTurnstileToken("");
        setTurnstileError("Security check expired. Please verify again.");
      },
      "error-callback": () => {
        setTurnstileToken("");
        setTurnstileError("Security check failed to load. Please refresh and try again.");
      },
    }) ?? null;

    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  }, [turnstileDisabled, turnstileLoaded, turnstileSiteKey]);

  // Validation
  const firstNameValid = firstName.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(firstName.trim());
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const countryValid = country.length > 0;
  const destinationValid = destination.length > 0;
  const turnstileReady = turnstileDisabled || (!!turnstileToken && !!turnstileSiteKey);
  const isValid = firstNameValid && emailValid && countryValid && destinationValid && turnstileReady;

  const showFirstNameError = firstNameTouched && firstName.length > 0 && !firstNameValid;
  const showEmailError = emailTouched && email.length > 0 && !emailValid;
  const showCountryError = countryTouched && !countryValid;
  const showDestinationError = destinationTouched && !destinationValid;

  const referralLink = submitted
    ? `${typeof window !== "undefined" ? window.location.origin : "https://alutta.com"}?ref=${submitted.referralCode}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCountryChange = (value: string) => {
    countryManuallyChanged.current = true;
    setCountry(value);
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
    setCountryTouched(true);
    setDestinationTouched(true);
    if (!firstNameValid || !emailValid || !countryValid || !destinationValid) return;

    if (!turnstileDisabled && !turnstileSiteKey) {
      setError("Security check is not configured. Please try again later.");
      return;
    }

    if (!turnstileDisabled && !turnstileToken) {
      setTurnstileError("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim().toLowerCase(),
          country,
          destination,
          referredBy,
          source,
          utm: getUtmParams(),
          turnstileToken: turnstileDisabled ? "local-bypass" : turnstileToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setTurnstileToken("");
        if (turnstileWidgetId.current) window.turnstile?.reset(turnstileWidgetId.current);
        setIsSubmitting(false);
        return;
      }

      setSubmitted({
        referralCode: data.referralCode,
        alreadySignedUp: data.alreadySignedUp,
      });
    } catch {
      setError("Connection error. Please check your internet and try again.");
      setTurnstileToken("");
      if (turnstileWidgetId.current) window.turnstile?.reset(turnstileWidgetId.current);
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
            {submitted.alreadySignedUp ? "You are already on the list!" : "You are on the list! 🎉"}
          </h3>
          {!submitted.alreadySignedUp && (
            <p className="text-gray-500 text-sm">
              You are in. Check your inbox for a confirmation email.
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
      {!turnstileDisabled && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setTurnstileLoaded(true)}
        />
      )}

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
          placeholder="Ayomide"
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
          placeholder="ayomide@gmail.com"
          disabled={isSubmitting}
          className={inputClass(!!showEmailError)}
          autoComplete="email"
        />
        {showEmailError && (
          <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <SearchableCountryField
            label="Your Country"
            value={country}
            options={sourceCountries}
            placeholder="Search your country"
            hasError={showCountryError}
            disabled={isSubmitting}
            onChange={handleCountryChange}
            onBlur={() => setCountryTouched(true)}
          />
          {showCountryError && (
            <p className="mt-1 text-xs text-red-500">Please select your country</p>
          )}
        </div>

        <div>
          <SearchableCountryField
            label="Study Destination"
            value={destination}
            options={destinationCountries}
            placeholder="Search destination"
            hasError={showDestinationError}
            disabled={isSubmitting}
            onChange={setDestination}
            onBlur={() => setDestinationTouched(true)}
          />
          {showDestinationError && (
            <p className="mt-1 text-xs text-red-500">Please select your destination</p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">{error}</p>
      )}

      {!turnstileDisabled && (
        <div className="min-h-[65px]">
          {turnstileSiteKey ? (
            <div ref={turnstileRef} />
          ) : (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">
              Security check is not configured.
            </p>
          )}
          {turnstileError && (
            <p className="mt-1 text-xs text-red-500">{turnstileError}</p>
          )}
        </div>
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
