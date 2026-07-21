"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { page, track } from "@/lib/analytics";

// Mounted once in the root layout. Fires a pageview on every route change and
// auto-tracks clicks on any element carrying a `data-track="<key>"` attribute —
// no per-element wiring needed. The `<key>` matches an event tag in the workspace.
export function Analytics() {
  const pathname = usePathname();

  // Pageview on first paint and on every client navigation. The full URL (with
  // UTMs) is read inside page(); this effect just triggers it on route change.
  useEffect(() => {
    page();
  }, [pathname]);

  // Delegated click listener: one handler for all current and future
  // [data-track] elements.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.("[data-track]");
      if (!el) return;
      const key = el.getAttribute("data-track");
      if (key) track(key);
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
