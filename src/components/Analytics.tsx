"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { page, track } from "@/lib/analytics";

// Mounted once in the root layout. Fires a pageview on every route change and
// counts two things with no per-element wiring: a click on anything carrying
// `data-track="<key>"`, and the first time a section carrying
// `data-track-view="<key>"` comes into view. Every `<key>` is one of the
// vocabulary in lib/tracking.ts, which is also what analytics-service seeds as
// an EventTag, so the workspace lists it by name.
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

  // HOW FAR DOWN PEOPLE GET. A pageview says they arrived; it says nothing
  // about whether they ever reached the part of the page that asks them to
  // join. Each [data-track-view] section counts ONCE per page: a section
  // scrolled past, back to and past again is still one person who saw it.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = entry.target.getAttribute("data-track-view");
          if (key && !seen.has(key)) {
            seen.add(key);
            track(key);
          }
          observer.unobserve(entry.target);
        }
      },
      // A third of the section on screen: enough that it was read past, not
      // just clipped by the bottom of the window on the way down.
      { threshold: 0.33 },
    );
    for (const el of document.querySelectorAll("[data-track-view]")) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
