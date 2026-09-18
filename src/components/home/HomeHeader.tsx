"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MarketSelector from "@/components/markets/MarketSelector";
import MarketSuggestion from "@/components/markets/MarketSuggestion";
import { AnnouncementStrip } from "@/components/waitlist/AnnouncementStrip";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { STUDENT_SIGNIN_URL } from "@/lib/site";
// label, href, and the event key the click is counted as (lib/tracking.ts).
const NAV_GLOBAL: [string, string, string][] = [['The Alutta way', '#about', 'nav-about'], ['Explore destinations', '#destinations', 'nav-destinations'], ['Your journey', '#how-it-works', 'nav-journey'], ['Questions?', '#questions', 'nav-questions']];
const NAV_NG: [string, string, string][] = [['The Alutta way', '#about', 'nav-about'], ['Your profile', '#profile', 'nav-profile'], ['Your journey', '#how-it-works', 'nav-journey'], ['Questions?', '#questions', 'nav-questions']];

export default function HomeHeader({ onJoin, home = false }: { onJoin?: () => void; home?: boolean }) {
 const nigeria = usePathname().startsWith("/ng");
 const base = nigeria ? "/ng" : "";
 const [mobile, setMobile] = useState(false);
 return <>      <AnnouncementStrip joinHref={`${base}/waitlist`} onJoin={onJoin} />
      <header className="atlas-header">
        <div className="atlas-nav-wrap">
          <Link className="atlas-brand" href={base || "/"} aria-label="Alutta home"><Image src="/brand/logo-horizontal-coloured.svg" alt="Alutta" width={130} height={38} priority /></Link>
          <nav aria-label="Main navigation" className={mobile ? "atlas-nav open" : "atlas-nav"}>
            {(nigeria ? NAV_NG : NAV_GLOBAL).map(([label, href, track]) => <a key={href} href={home ? href : `${base}/${href}`.replace("/ng/#", "/ng#")} data-track={track} onClick={() => setMobile(false)}>{label}</a>)}
            <a className="atlas-mobile-signin" href={STUDENT_SIGNIN_URL} data-track="signin">Sign in <ArrowUpRight size={15} /></a>
          </nav>
          <div className="atlas-nav-actions"><div className="header-market"><MarketSelector /></div><a className="atlas-signin" href={STUDENT_SIGNIN_URL} data-track="signin">Sign in</a>{onJoin ? <button className="atlas-button compact" onClick={onJoin} data-track="join-header">Join the waitlist <ArrowUpRight size={17} /></button> : <Link className="atlas-button compact" href={`${base}/waitlist`} data-track="join-header">Join the waitlist <ArrowUpRight size={17} /></Link>}<button className="atlas-menu-button" aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>{mobile ? <X /> : <Menu />}</button></div>
        </div>
      </header><MarketSuggestion /></>;
}
