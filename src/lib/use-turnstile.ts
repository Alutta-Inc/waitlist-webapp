"use client";

import { useEffect, useRef, useState } from "react";

/** Cloudflare Turnstile for one form, pinned to that form's action.
 *
 *  The researcher removal form and the site block form both need exactly the
 *  same widget lifecycle (render once the script is ready, clear the token on
 *  expiry, error or timeout, reset after a refused submit), so it lives here
 *  once. The waitlist form predates this and keeps its own copy.
 *
 *  The local bypass is inlined at build time and never honoured by a
 *  production build, the same rule the server routes apply. */
export function useTurnstile(action: string) {
  const [loaded, setLoaded] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const disabled = process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === "true";

  useEffect(() => {
    if (disabled || !loaded || !ref.current || !siteKey || widgetId.current) return;
    widgetId.current = window.turnstile?.render(ref.current, {
      sitekey: siteKey,
      action,
      callback: (t) => { setToken(t); setError(null); },
      "expired-callback": () => { setToken(""); setError("Security check expired. Please verify again."); },
      "error-callback": () => { setToken(""); setError("Security check failed to load. Please refresh and try again."); },
      "timeout-callback": () => { setToken(""); setError("The security check timed out. Please try again."); },
    }) ?? null;
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [disabled, loaded, siteKey, action]);

  return {
    ref,
    disabled,
    siteKey,
    token,
    error,
    setError,
    /** Ready to submit: bypassed locally, or a solved token with a site key. */
    ready: disabled || (!!token && !!siteKey),
    /** What the route receives. */
    submitToken: disabled ? "local-bypass" : token,
    onScriptReady: () => setLoaded(true),
    reset: () => {
      setToken("");
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  };
}
