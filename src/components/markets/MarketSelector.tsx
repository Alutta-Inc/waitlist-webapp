"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Globe2, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { markets, marketForPath, marketPath, type Market } from "@/lib/markets";

export function rememberMarket(market: Market) {
  try { localStorage.setItem("alutta-market-choice", JSON.stringify({ market, expires: Date.now() + 180 * 86400000 })); } catch {}
  window.dispatchEvent(new Event("alutta-market-choice"));
}
export default function MarketSelector() {
  const path = usePathname();
  const selected = marketForPath(path);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <div ref={root} className="market-selector" onKeyDown={event => { if (event.key === "Escape") { setOpen(false); root.current?.querySelector('button')?.focus(); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button aria-label={`Website region: ${selected === "ng" ? "Nigeria" : "Global"}`} aria-expanded={open} onClick={() => setOpen(!open)}>{selected === "ng" ? <Image src="/images/flag-ng.svg" alt="" width={20} height={14}/> : <Globe2 size={18}/>}<span>{selected === "ng" ? "Nigeria" : "Global"}</span><ChevronDown size={14}/></button>
    {open && <nav className="market-options" aria-label="Choose website region">{markets.map(market => <Link key={market.code} href={marketPath(path, market.code)} aria-current={selected === market.code ? "page" : undefined} onClick={() => { rememberMarket(market.code); setOpen(false); }}>{market.code === "ng" ? <Image src="/images/flag-ng.svg" alt="" width={23} height={16}/> : <Globe2 size={22}/>}<span><strong>{market.name}</strong><small>{market.description}</small></span>{selected === market.code && <Check size={17}/>}</Link>)}</nav>}
  </div>;
}
