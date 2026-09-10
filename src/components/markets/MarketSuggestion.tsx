"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { X, ArrowUpRight } from "lucide-react";
import { marketForPath, marketPath } from "@/lib/markets";
import { rememberMarket } from "./MarketSelector";

export default function MarketSuggestion() {
  const path = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (marketForPath(path) === "ng") return;
    const controller = new AbortController();
    const hide = () => setVisible(false);
    const check = async () => {
      try {
        const saved = JSON.parse(localStorage.getItem("alutta-market-choice") || "null");
        if (saved?.expires > Date.now() || sessionStorage.getItem("alutta-market-dismissed")) return;
        if (saved) localStorage.removeItem("alutta-market-choice");
        const response = await fetch("/api/geo", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (data.countryCode === "NG" && !controller.signal.aborted && !localStorage.getItem("alutta-market-choice")) setVisible(true);
      } catch { /* Unknown location or blocked storage: stay on Global. */ }
    };
    check();
    window.addEventListener("alutta-market-choice", hide);
    return () => { controller.abort(); window.removeEventListener("alutta-market-choice", hide); };
  }, [path]);
  if (!visible || marketForPath(path) === "ng") return null;
  return <aside className="market-suggestion" aria-label="Nigeria website suggestion"><button className="market-dismiss" aria-label="Dismiss region suggestion" onClick={() => { setVisible(false); try { sessionStorage.setItem("alutta-market-dismissed", "1"); } catch {} }}><X size={19}/></button><Image src="/images/flag-ng.svg" alt="" width={31} height={21}/><h2>Visiting from Nigeria?</h2><p>Explore an Alutta experience tailored to students in Nigeria, with opportunities at home and abroad.</p><div><button onClick={() => { rememberMarket("ng"); setVisible(false); router.push(marketPath(path, "ng") + window.location.search); }}>Explore Alutta Nigeria <ArrowUpRight size={17}/></button><button onClick={() => { rememberMarket("global"); setVisible(false); }}>Stay on Global</button></div></aside>;
}
