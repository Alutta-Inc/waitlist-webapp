"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Plane } from "lucide-react";
import Globe from "./Globe";
import HomeHeader from "./HomeHeader";
import CareersFooter from "./CareersFooter";

export default function NotFoundExperience() {
  const pathname = usePathname();
  const nigeria = pathname === "/ng" || pathname.startsWith("/ng/");
  const home = nigeria ? "/ng" : "/";
  return <div className="atlas-home lost-home">
    <HomeHeader />
    <section className="lost-section" aria-labelledby="not-found-heading">
      <div className="lost-art" aria-hidden="true">
        <span className="lost-digit">4</span>
        <div className="lost-world"><Globe className="lost-globe"/><span className="lost-orbit"><Plane size={25} strokeWidth={1.7}/></span><span className="lost-dot"/></div>
        <span className="lost-digit">4</span>
      </div>
      <span className="lost-eyebrow">PAGE NOT FOUND</span>
      <h1 id="not-found-heading">A little off course.<br/><span>Still a world ahead.</span></h1>
      <p>This page is missing, but your next chapter is not.<br className="lost-break"/> Let us get you back to somewhere familiar.</p>
      <div className="lost-actions"><Link href={home} className="atlas-button">Back to home <ArrowUpRight size={19}/></Link><Link href={`${home === "/" ? "" : home}/#how-it-works`.replace("/ng/#", "/ng#")} className="lost-secondary">Explore your journey <ArrowRight size={18}/></Link></div>
      <div className="lost-footnote"><span/>Big dreams do not end at a wrong turn.</div>
    </section>
    <CareersFooter nigeria={nigeria} topId="not-found-heading" />
  </div>;
}
