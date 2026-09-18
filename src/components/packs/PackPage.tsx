"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight, BadgeCheck, Check, Mail, Printer, ShieldCheck, Sparkles } from "lucide-react";

import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";

/** A pack: the page Alutta sends to the people on the other side of a student's
 *  application. /partners (institutions) and /funding-bodies are both one of
 *  these, with their own words (PartnersPage.tsx, FundersPage.tsx).
 *
 *  Below the hero it is a DOCUMENT: the legal page's parts (numbered sections,
 *  sticky contents, contact band), and it prints to a clean PDF with the Print
 *  button, which is how most offices will pass it to a colleague.
 *
 *  THE HERO IS THE HOME PAGE'S, not the legal page's. Somebody deciding whether
 *  to answer our email lands here first, and the paper-on-an-orbit hero of the
 *  policy pages told them they had opened a policy. So it is built from the
 *  home hero's own parts (the arch, the halo, the floating labels that lean
 *  away from the pointer), and what floats is the offer itself. The card's
 *  line changes every few seconds; with reduced motion it holds still on the
 *  first. */

export const EMAIL = "partnerships@alutta.com";

export type Block =
  | { p: string }
  | { list: string[] }
  | { ways: { tag: string; title: string; body: string; points: string[] }[] }
  | { terms: { label: string; value: string }[] }
  | { steps: { title: string; body: string }[] }
  | { asked: { q: string; a: string }[] };

export type Section = { id: string; title: string; blocks: Block[] };

export type Pack = {
  /** Where it lives, without the slash: printed at the foot of the PDF. */
  path: string;
  eyebrow: string;
  heading: [string, string, string];
  intro: string;
  /** The one reassurance under the buttons. */
  promise: string;
  image: { src: string; alt: string; position: string };
  caption: string;
  /** The two floating labels, and the card whose line changes. */
  orbit: string;
  flight: [string, string];
  card: { heading: string; lines: [string, string][] };
  document: { title: string; lead: string; contents: string };
  updated: { iso: string; label: string };
  sections: Section[];
  /** Phrases in the copy that are links to our own pages. */
  links: { phrase: string; href: string }[];
  contact: { heading: [string, string]; body: string };
  callSubject: string;
};

function Paragraph({ text, links }: { text: string; links: Pack["links"] }) {
  const link = links.find((item) => text.includes(item.phrase));
  if (link) {
    const [before, after] = text.split(link.phrase);
    return <p>{before}<Link href={link.href}>{link.phrase}</Link>{after}</p>;
  }
  if (!text.includes(EMAIL)) return <p>{text}</p>;
  const [before, after] = text.split(EMAIL);
  return <p>{before}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{after}</p>;
}

function Body({ block, links }: { block: Block; links: Pack["links"] }): ReactNode {
  if ("p" in block) return <Paragraph text={block.p} links={links} />;
  if ("list" in block)
    return (
      <ul className="pack-list">
        {block.list.map((item) => <li key={item}><Check size={16} aria-hidden="true" /><span>{item}</span></li>)}
      </ul>
    );
  if ("ways" in block)
    return (
      <div className="pack-ways">
        {block.ways.map((way) => (
          <div key={way.title} className="pack-way">
            <span className="pack-tag">{way.tag}</span>
            <h3>{way.title}</h3>
            <p>{way.body}</p>
            <ul>{way.points.map((point) => <li key={point}>{point}</li>)}</ul>
          </div>
        ))}
      </div>
    );
  if ("terms" in block)
    return (
      <dl className="pack-terms" data-count={block.terms.length}>
        {block.terms.map((term) => <div key={term.label}><dt>{term.label}</dt><dd>{term.value}</dd></div>)}
      </dl>
    );
  if ("steps" in block)
    return (
      <ol className="pack-steps">
        {block.steps.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.body}</span></li>)}
      </ol>
    );
  return (
    <dl className="pack-asked">
      {block.asked.map((item) => <div key={item.q}><dt>{item.q}</dt><dd><Paragraph text={item.a} links={links} /></dd></div>)}
    </dl>
  );
}

export default function PackPage({ pack }: { pack: Pack }) {
  const { sections, card } = pack;
  const call = `mailto:${EMAIL}?subject=${encodeURIComponent(pack.callSubject)}`;
  const [active, setActive] = useState(0);
  const [line, setLine] = useState(0);
  const heroVisual = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setLine((at) => (at + 1) % card.lines.length), 2800);
    return () => window.clearInterval(timer);
  }, [card.lines.length]);
  useEffect(() => {
    const update = () => {
      let current = 0;
      sections.forEach((section, index) => {
        if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= 200) current = index;
      });
      setActive(current);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [sections]);

  return (
    <div className="atlas-home legal-home pack-home">
      <HomeHeader />

      <section className="atlas-hero atlas-container pack-hero" aria-labelledby="pack-heading">
        <div className="atlas-hero-copy">
          <p className="atlas-eyebrow"><span /> {pack.eyebrow}</p>
          <h1 id="pack-heading"><span className="atlas-title-line">{pack.heading[0]}</span><span className="atlas-title-line">{pack.heading[1]}</span><em className="atlas-title-line">{pack.heading[2]}</em></h1>
          <p className="atlas-hero-intro">{pack.intro}</p>
          <div className="atlas-hero-buttons">
            <a className="atlas-button" href={call}>Arrange a call <ArrowUpRight size={21} /></a>
            <a className="pack-hero-read" href="#pack-document">Read the {pack.document.title.toLowerCase()} <ArrowDown size={18} /></a>
          </div>
          <div className="atlas-small-promise"><ShieldCheck size={17} /><span>{pack.promise}</span></div>
        </div>
        <div className="atlas-hero-visual" ref={heroVisual}
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty("--hero-x", `${((event.clientX - rect.left) / rect.width - .5) * 10}px`);
            event.currentTarget.style.setProperty("--hero-y", `${((event.clientY - rect.top) / rect.height - .5) * 10}px`);
          }}
          onPointerLeave={() => { heroVisual.current?.style.setProperty("--hero-x", "0px"); heroVisual.current?.style.setProperty("--hero-y", "0px"); }}>
          <div className="atlas-hero-halo" aria-hidden="true" />
          <div className="atlas-image-arch"><Image src={pack.image.src} alt={pack.image.alt} fill priority sizes="(max-width: 760px) 100vw, 50vw" style={{ objectPosition: pack.image.position }} /></div>
          <div className="atlas-orbit-label"><Sparkles size={20} /> {pack.orbit}</div>
          <div className="atlas-flight-label"><BadgeCheck size={19} /><span>{pack.flight[0]}<strong>{pack.flight[1]}</strong></span></div>
          <div className="atlas-destination-preview pack-hero-card">
            <span className="atlas-destination-question">{card.heading}</span>
            <div className="pack-hero-line"><span key={line}>{card.lines[line][0]}<strong>{card.lines[line][1]}</strong></span></div>
            <div className="pack-hero-dots" aria-hidden="true">{card.lines.map((item, index) => <i key={item[0]} data-on={index === line} />)}</div>
          </div>
          <span className="atlas-photo-caption">{pack.caption}</span>
        </div>
      </section>

      <div className="legal-layout legal-container" id="pack-document">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-inner">
            <span className="legal-eyebrow">{pack.document.contents}</span>
            <nav aria-label="Sections">
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`} aria-current={active === index ? "location" : undefined}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{section.title}
                </a>
              ))}
            </nav>
            <div className="legal-sidebar-contact">
              <Mail size={20} />
              <strong>Rather talk it through?</strong>
              <p>Twenty minutes with the partnerships desk.</p>
              <a href={call}>Arrange a call <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </aside>

        <article className="legal-document" aria-labelledby="pack-document-heading">
          <header className="legal-document-header">
            <div className="legal-document-meta">
              <span>Last updated: <time dateTime={pack.updated.iso}>{pack.updated.label}</time></span>
              <button onClick={() => window.print()} aria-label={`Print the ${pack.document.title.toLowerCase()}, or save it as a PDF`}><Printer size={17} />Print or save as PDF</button>
            </div>
            <h2 id="pack-document-heading">{pack.document.title}</h2>
            <p>{pack.document.lead}</p>
          </header>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="legal-section">
              <div className="legal-section-title"><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
              {section.blocks.map((block, at) => <Body key={at} block={block} links={pack.links} />)}
            </section>
          ))}

          <p className="pack-print-contact">Alutta Partnerships · {EMAIL} · alutta.com/{pack.path}</p>
        </article>
      </div>

      <section className="legal-contact legal-container">
        <div>
          <span className="legal-eyebrow">THE NEXT STEP</span>
          <h2>{pack.contact.heading[0]}<br /><em>{pack.contact.heading[1]}</em></h2>
          <p>{pack.contact.body}</p>
        </div>
        <a className="atlas-button lime" href={call}>{EMAIL} <ArrowUpRight size={20} /></a>
      </section>

      <CareersFooter topId="pack-heading" />
    </div>
  );
}
