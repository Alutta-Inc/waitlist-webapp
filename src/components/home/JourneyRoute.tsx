"use client";

import { useEffect, useRef } from "react";
import { FileCheck2, GraduationCap, House, Plane, Wallet } from "lucide-react";

const steps = [{ Icon: GraduationCap, text: "Apply" }, { Icon: Wallet, text: "Pay" }, { Icon: FileCheck2, text: "Prepare" }, { Icon: Plane, text: "Travel" }, { Icon: House, text: "Settle" }];

export default function JourneyRoute() {
  const route = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = route.current;
    if (!element) return;
    const stops = Array.from(element.querySelectorAll("li"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      // Scrub all four legs while the strip moves through the visible viewport.
      const start = window.innerHeight * 0.85;
      const end = Math.max(150, window.innerHeight * 0.25);
      const progress = clamp((start - (rect.top + rect.height / 2)) / Math.max(1, start - end)) * (steps.length - 1);
      stops.forEach((stop, index) => {
        const leg = clamp(progress - index);
        const arrival = index === 0 ? 1 : clamp((progress - index + 0.15) / 0.15);
        stop.style.setProperty("--leg", String(leg));
        stop.style.setProperty("--position", `${leg * 100}%`);
        stop.style.setProperty("--traveller-opacity", String(reducedMotion.matches ? 0 : Math.min(1, leg * 8, (1 - leg) * 8)));
        stop.style.setProperty("--flight-lift", `${-Math.sin(leg * Math.PI) * 15}px`);
        stop.style.setProperty("--flight-angle", `${-12 + leg * 24}deg`);
        stop.style.setProperty("--stop-fill", String(arrival));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, []);

  return <div ref={route} className="benefits-route animated-route">
    <ol aria-label="Your journey: Apply, Pay, Prepare, Travel, Settle">
      {steps.map(({ Icon, text }, index) => <li key={text}>
        <span className="route-stop"><Icon aria-hidden="true" />{text}</span>
        {index < steps.length - 1 && <div className="route-connection" aria-hidden="true"><span className="route-light" /><span className={`route-traveller${text === "Travel" ? " route-plane" : ""}`}><Icon /></span><span className="route-spark">&#10022;</span></div>}
      </li>)}
    </ol>
  </div>;
}
