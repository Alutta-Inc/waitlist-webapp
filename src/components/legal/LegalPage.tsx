"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, FileText, Mail, Printer, ShieldCheck } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";
import "@/components/home/home.css";
import "./legal.css";

type Section = { title: string; body: string[] };
const sectionId = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function LegalPage({ kind, sections }: { kind: "terms" | "privacy"; sections: Section[] }) {
  const privacy = kind === "privacy";
  const title = privacy ? "Privacy Policy" : "Terms of Service";
  const [active, setActive] = useState(0);
  useEffect(() => {
    const update = () => {
      let current = 0;
      sections.forEach((section, index) => {
        if ((document.getElementById(sectionId(section.title))?.getBoundingClientRect().top ?? Infinity) <= 200) current = index;
      });
      setActive(current);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [sections]);
  const Icon = privacy ? ShieldCheck : FileText;
  return <div className="atlas-home legal-home">
    <HomeHeader />
    <section className="legal-hero legal-container" aria-labelledby="legal-heading">
      <div className="legal-hero-copy"><span className="legal-eyebrow"><span /> THE DETAILS, MADE CLEAR</span><h1 id="legal-heading">{privacy ? <>Your information.<br /><em>Your peace of mind.</em></> : <>A shared understanding.<br /><em>A clearer path.</em></>}</h1><p>{privacy ? "Understand what you share with Alutta, how we use it, and the choices you have along the way." : "A little clarity goes a long way. Here’s what to know about using Alutta and joining our early access community."}</p><a className="legal-read-link" href="#legal-document">Read the {privacy ? "policy" : "terms"} <ArrowDown size={18} /></a></div>
      <div className="legal-hero-art" aria-hidden="true"><div className="legal-orbit" /><div className="legal-paper"><span className="legal-paper-icon"><Icon size={38} strokeWidth={1.4} /></span><span className="legal-paper-label">ALUTTA · {privacy ? "PRIVACY" : "TERMS"}</span><strong>{privacy ? "Trust starts with\ntransparency." : "On the same page.\nFrom day one."}</strong><i /><i /><i /><span className="legal-paper-seal"><Check size={16} /> Clarity at every step</span></div><span className="legal-art-note">A brighter you.<br />With a little more clarity.</span></div>
    </section>
    <div className="legal-container"><nav className="legal-switcher" aria-label="Legal documents"><Link href="/terms" aria-current={!privacy ? "page" : undefined}><FileText size={19} />Terms of Service</Link><Link href="/privacy" aria-current={privacy ? "page" : undefined}><ShieldCheck size={19} />Privacy Policy</Link><span>Built on understanding.</span></nav></div>
    <div className="legal-layout legal-container" id="legal-document">
      <aside className="legal-sidebar"><div className="legal-sidebar-inner"><span className="legal-eyebrow">ON THIS PAGE</span><nav aria-label="Document sections">{sections.map((section, index) => <a key={section.title} href={`#${sectionId(section.title)}`} aria-current={active === index ? "location" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}</nav><div className="legal-sidebar-contact"><Mail size={20} /><strong>Something on your mind?</strong><p>We’re here to help you understand.</p><a href="mailto:hello@alutta.com">Talk to us <ArrowUpRight size={16} /></a></div></div></aside>
      <article className="legal-document" aria-labelledby="document-heading"><header className="legal-document-header"><div className="legal-document-meta"><span>Last updated: <time dateTime="2026-05-13">May 13, 2026</time></span><button onClick={() => window.print()} aria-label={`Print ${title}`}><Printer size={17} />Print</button></div><h2 id="document-heading">{title}</h2><p>{privacy ? "This Privacy Policy explains how Alutta collects, uses, stores, and protects information when you visit our website or join the early access waitlist." : "These Terms govern your use of the Alutta website and early access waitlist. By using the website or joining the waitlist, you agree to these Terms."}</p></header>
        {sections.map((section, index) => <section key={section.title} id={sectionId(section.title)} className="legal-section"><div className="legal-section-title"><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>{section.body.map(paragraph => <p key={paragraph}>{paragraph.includes("hello@alutta.com") ? <>{paragraph.split("hello@alutta.com")[0]}<a href="mailto:hello@alutta.com">hello@alutta.com</a>{paragraph.split("hello@alutta.com")[1]}</> : paragraph}</p>)}</section>)}
        <div className="legal-related"><span>Keep reading</span><Link href={privacy ? "/terms" : "/privacy"}>{privacy ? "Terms of Service" : "Privacy Policy"}<ArrowRight size={22} /></Link></div>
      </article>
    </div>
    <section className="legal-contact legal-container"><div><span className="legal-eyebrow">LET’S KEEP THINGS CLEAR</span><h2>Questions deserve<br /><em>real answers.</em></h2><p>For questions about our terms or your information, get in touch.</p></div><a className="atlas-button lime" href="mailto:hello@alutta.com">hello@alutta.com <ArrowUpRight size={20} /></a></section>
    <CareersFooter topId="legal-heading" />
  </div>;
}
