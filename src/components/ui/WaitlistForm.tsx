"use client";

import Image from "next/image";
import Script from "next/script";
import { useState, useEffect, useId, useMemo, useRef } from "react";
import { Loader2, ArrowRight, Check, Copy, Share2, Search, ChevronDown, UserRound, Mail, ShieldCheck } from "lucide-react";
import { destinationCountries, sourceCountries } from "@/lib/journey-data";
import { track } from "@/lib/analytics";
import { TURNSTILE_ACTION, TURNSTILE_SCRIPT_URL } from "@/lib/turnstile";
import { cn } from "@/lib/utils";
import { HONEYPOT_FIELD } from "@/lib/waitlist-input";

type FormVariant = "hero" | "cta";
type TurnstileWidgetId = string;

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          "timeout-callback"?: () => void;
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
  initialDestination?: string;
  destinationNames?: string[];
  onSuccess?: () => void;
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
  const selectedCode = options.find(option => option.name === value)?.code.toLowerCase().replace("uk", "gb");
  const localFlag = selectedCode && ["ng", "gb", "us", "ca", "cn", "au"].includes(selectedCode);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeOption, setActiveOption] = useState(0);
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
        {localFlag && !open ? <Image src={`/images/flag-${selectedCode}.svg`} alt="" width={23} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-sm" /> : <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />}
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
            setActiveOption(0);
            if (value) onChange("");
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-xl bg-transparent px-10 py-3 text-brand-dark outline-none placeholder:text-gray-400"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault(); setOpen(true);
              setActiveOption(index => Math.max(0, Math.min(visibleOptions.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
            } else if (event.key === "Enter" && open) {
              event.preventDefault(); const choice = visibleOptions[activeOption];
              if (choice) { onChange(choice.name); setQuery(choice.name); setOpen(false); }
            } else if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
          }}
          aria-activedescendant={open && visibleOptions[activeOption] ? `${listboxId}-${activeOption}` : undefined}
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
              visibleOptions.map((option, index) => (
                <button
                  key={option.code}
                  type="button"
                  id={`${listboxId}-${index}`}
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
                    (value === option.name || activeOption === index) ? "bg-brand-accent/10 text-brand-dark" : "text-gray-600"
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

/** The referral code in the URL, in the shape we issue them (alphanumeric,
 *  4 to 16 characters) or nothing. Anything else is not a code of ours. */
function getReferralCode() {
  if (typeof window === "undefined") return null;
  const raw = (new URLSearchParams(window.location.search).get("ref") || "").trim().toUpperCase();
  return /^[A-Z0-9]{4,16}$/.test(raw) ? raw : null;
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

export default function WaitlistForm({ variant = "hero", source = "hero", initialDestination = "", destinationNames, onSuccess }: WaitlistFormProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [destination, setDestination] = useState(initialDestination);
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
  // The bypass exists for local work only. NODE_ENV is inlined at build time,
  // so a production build renders the widget whatever the variable says, the
  // same rule the route applies server-side; a stray flag in a deploy's env
  // cannot ship a form that sends a bypass token the server will refuse.
  const turnstileDisabled = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === "true";

  // Pre-fill from URL if user lands from a referral, and ask customer-service
  // (through /api/referral) whose code it is. A real code shows the
  // referrer's first name; an unknown one shows nothing and is not sent, so
  // a typo cannot be mistaken for a friend's invitation.
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  useEffect(() => {
    const code = getReferralCode();
    if (!code) return;
    let cancelled = false;
    setReferredBy(code);
    fetch(`/api/referral?code=${encodeURIComponent(code)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { valid?: boolean | null; referrerFirstName?: string } | null) => {
        if (cancelled || !data) return;
        if (data.valid === false) setReferredBy(null);
        else if (data.valid === true && data.referrerFirstName) setReferrerName(data.referrerFirstName);
      })
      .catch(() => { /* an outage keeps the code; customer-service checks it again on signup */ });
    return () => { cancelled = true; };
  }, []);

  // The honeypot. A person never sees this field; a script that fills every
  // input in the form does, and the route refuses the request.
  const [honeypot, setHoneypot] = useState("");

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
      action: TURNSTILE_ACTION,
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
      "timeout-callback": () => {
        setTurnstileToken("");
        setTurnstileError("The security check timed out. Please try again.");
      },
    }) ?? null;

    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
        turnstileWidgetId.current = null;
      }
    };
  }, [turnstileDisabled, turnstileLoaded, turnstileSiteKey]);

  // Validation. The name rule is the server's (lib/waitlist-input.ts): any
  // letter in any script, so Adéọlá and Ngozi pass here exactly as they pass
  // there, rather than an ASCII-only check refusing a name the server accepts.
  const firstNameValid = firstName.trim().length >= 2 && /^[\p{L}\p{M}][\p{L}\p{M}\s'’\-.]*$/u.test(firstName.trim());
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
    ? `${typeof window !== "undefined" ? window.location.origin : "https://alutta.com"}${source === "nigeria-waitlist" ? "/ng/waitlist" : ""}?ref=${submitted.referralCode}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access (an insecure context, or permission refused): the
      // link is printed above the button and can be selected by hand.
    }
  };

  const handleCountryChange = (value: string) => {
    countryManuallyChanged.current = true;
    setCountry(value);
  };

  const handleShare = async () => {
    track("share-referral");
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Alutta",
          text: "I just joined the Alutta waitlist, the platform for international students. Join using my link:",
          url: referralLink,
        });
      } catch {
        // The share sheet was dismissed, or the platform refused it. Nothing to do.
      }
    } else {
      void handleCopy();
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

    // We already know the ISO code for each selected country — send it so
    // customer-service stores the canonical alpha-2 key, not just a name.
    const countryCode = sourceCountries.find((c) => c.name === country)?.code ?? "";
    const destinationCode = destinationCountries.find((c) => c.name === destination)?.code ?? "";

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim().toLowerCase(),
          country,
          countryCode,
          destination,
          destinationCode,
          referredBy,
          source,
          utm: getUtmParams(),
          [HONEYPOT_FIELD]: honeypot,
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

      // Real conversion — record it as the "waitlist-signup" event tag. New
      // signups only, so re-submits by an existing email do not inflate the count.
      if (!data.alreadySignedUp) track("waitlist-signup", { source });

      onSuccess?.();
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
          src={TURNSTILE_SCRIPT_URL}
          strategy="afterInteractive"
          onReady={() => setTurnstileLoaded(true)}
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
        <div className="waitlist-input-wrap"><UserRound className="waitlist-field-icon hidden" aria-hidden="true" /><input
          type="text"
          aria-label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => setFirstNameTouched(true)}
          placeholder="Ayomide"
          disabled={isSubmitting}
          className={inputClass(!!showFirstNameError)}
          autoComplete="given-name"
        /></div>
        {showFirstNameError && (
          <p className="mt-1 text-xs text-red-500">Please enter your first name (letters only)</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-dark mb-1.5">Email Address</label>
        <div className="waitlist-input-wrap"><Mail className="waitlist-field-icon hidden" aria-hidden="true" /><input
          type="email"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="ayomide@gmail.com"
          disabled={isSubmitting}
          className={inputClass(!!showEmailError)}
          autoComplete="email"
        /></div>
        {showEmailError && (
          <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
        )}
      </div>

      {/* The honeypot: off screen, unlabelled, skipped by the tab order and by
          autofill. A person never reaches it; a script that fills every input
          does, and the route refuses the request. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor={`${HONEYPOT_FIELD}-field`}>Website</label>
        <input
          id={`${HONEYPOT_FIELD}-field`}
          type="text"
          name={HONEYPOT_FIELD}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
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
            options={destinationNames ? destinationNames.flatMap(name => destinationCountries.filter(country => country.name === name)) : destinationCountries}
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
        <ShieldCheck className="waitlist-privacy-icon hidden" aria-hidden="true" /> No spam. Unsubscribe anytime.
        {referredBy && <span className="block mt-1 text-brand-accent">✓ {referrerName ? `${referrerName} referred you` : "Referred by a friend"}</span>}
      </p>
    </form>
  );
}
