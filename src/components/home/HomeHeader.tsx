"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MarketSelector from "@/components/markets/MarketSelector";
import MarketSuggestion from "@/components/markets/MarketSuggestion";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { STUDENT_SIGNIN_URL } from "@/lib/site";
export default function HomeHeader({ onJoin, home = false }: { onJoin?: () => void; home?: boolean }) {
 const nigeria = usePathname().startsWith("/ng");
 const base = nigeria ? "/ng" : "";
 const [mobile, setMobile] = useState(false);
 return <>      <div className="atlas-announcement"><span className="atlas-status-dot" />Your next chapter is calling. <Link href={`${base}/waitlist`}>Private beta is open <ArrowUpRight size={13} /></Link></div>
      <header className="atlas-header">
        <div className="atlas-nav-wrap">
          <Link className="atlas-brand" href={base || "/"} aria-label="Alutta home"><Image src="/brand/logo-horizontal-coloured.svg" alt="Alutta" width={130} height={38} priority /></Link>
          <nav aria-label="Main navigation" className={mobile ? "atlas-nav open" : "atlas-nav"}>
            {(nigeria ? [['The Alutta way', '#about'], ['Your profile', '#profile'], ['Your journey', '#how-it-works'], ['Questions?', '#questions']] : [['The Alutta way', '#about'], ['Explore destinations', '#destinations'], ['Your journey', '#how-it-works'], ['Questions?', '#questions']]).map(([label, href]) => <a key={href} href={home ? href : `${base}/${href}`.replace("/ng/#", "/ng#")} onClick={() => setMobile(false)}>{label}</a>)}
            <div className="market-mobile"><MarketSelector /></div><a className="atlas-mobile-signin" href={STUDENT_SIGNIN_URL}>Sign in <ArrowUpRight size={15} /></a>
          </nav>
          <div className="atlas-nav-actions"><div className="market-desktop"><MarketSelector /></div><a className="atlas-signin" href={STUDENT_SIGNIN_URL}>Sign in</a>{onJoin ? <button className="atlas-button compact" onClick={onJoin}>Join the waitlist <ArrowUpRight size={17} /></button> : <Link className="atlas-button compact" href={`${base}/waitlist`}>Join the waitlist <ArrowUpRight size={17} /></Link>}<button className="atlas-menu-button" aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>{mobile ? <X /> : <Menu />}</button></div>
        </div>
      </header><MarketSuggestion /></>;
}
