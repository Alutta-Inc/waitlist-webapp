"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Mail, ScanSearch } from "lucide-react";

import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";

/** alutta.com/bot: AluttaBot, for the people who find it in their logs.
 *
 *  The address in the crawler's user agent. Whoever follows it is usually a
 *  university's web or IT team, not a researcher, so this page answers their
 *  questions in their terms: how to recognise it, what it reads, how hard it
 *  pushes, and the exact robots.txt lines that stop it. Researchers who want to
 *  be left out are sent to /researchers, which has the form.
 *
 *  Built from the legal page's parts, like /researchers. Every number here is
 *  a promise supervisor-service keeps (SUPERVISOR-SERVICE-DESIGN.md): change
 *  one there and it has to change here. */

/** Must match SUPERVISORS_USER_AGENT in supervisor-service exactly. */
const USER_AGENT = "AluttaBot/1.0 (+https://alutta.com/bot)";

type Block = string | { code: string; label: string } | { link: { before: string; label: string; href: string; after: string } };
type Section = { id: string; title: string; body: Block[] };

const sections: Section[] = [
  {
    id: "who-we-are",
    title: "Who runs it",
    body: [
      "AluttaBot is run by Alutta, a platform that helps students apply to universities abroad. It reads university websites for one feature, Supervisor Finder, which helps students applying for research degrees find researchers whose work matches their own.",
      { link: { before: "Researchers can read what Supervisor Finder shows about them, and ask to be left out, on ", label: "our page for researchers", href: "/researchers", after: "." } },
    ],
  },
  {
    id: "recognise-it",
    title: "How to recognise it",
    body: [
      "Every request AluttaBot makes carries this user agent:",
      { code: USER_AGENT, label: "AluttaBot user agent" },
      "We do not publish a list of IP addresses. If something calling itself AluttaBot behaves differently from what this page describes, it is not us, or something is wrong. Please tell us either way.",
    ],
  },
  {
    id: "what-it-reads",
    title: "What it reads",
    body: [
      "Only public pages on university websites: staff directories, department pages and researchers’ profile pages. It starts from the university’s own web address and follows links only within that university’s domain.",
      "It reads web pages and nothing else. It never logs in, submits a form, runs a page’s scripts or downloads files.",
    ],
  },
  {
    id: "how-often",
    title: "How hard it pushes",
    body: [
      "No more than one page a second from any website, and no more than 60 pages in a single visit to a university.",
      "A university is visited when a student starts looking for researchers there. What AluttaBot reads is reused for other students rather than fetched again, so repeat visits are infrequent.",
    ],
  },
  {
    id: "block",
    title: "Limiting or blocking it",
    body: [
      "AluttaBot follows robots.txt. To keep it off a whole website, add:",
      { code: "User-agent: AluttaBot\nDisallow: /", label: "robots.txt lines that block AluttaBot" },
      "To keep it out of one part of a site, disallow only that path, for example:",
      { code: "User-agent: AluttaBot\nDisallow: /staff/private/", label: "robots.txt lines that block one path" },
      "It checks robots.txt again at least once a day, so a change applies within 24 hours. If you would rather we stopped visiting a site altogether, write to us and we will.",
    ],
  },
  {
    id: "what-we-keep",
    title: "What we keep",
    body: [
      "From each page we keep only what Supervisor Finder shows: a researcher’s name, title and department, a link to their profile page, and a work email address where the page lists one, together with the address of the page it came from.",
      "We do not keep copies of your pages, and we never guess or construct an email address.",
    ],
  },
];

const EMAIL = "hello@alutta.com";

function Render({ block }: { block: Block }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("code" in block) {
    return <pre className="bot-code" aria-label={block.label}><code>{block.code}</code></pre>;
  }
  const { before, label, href, after } = block.link;
  return <p>{before}<Link href={href}>{label}</Link>{after}</p>;
}

export default function BotPage() {
  const stops = [...sections.map((s) => ({ id: s.id, title: s.title })), { id: "contact", title: "Contact" }];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const update = () => {
      let current = 0;
      stops.forEach((stop, index) => {
        if ((document.getElementById(stop.id)?.getBoundingClientRect().top ?? Infinity) <= 200) current = index;
      });
      setActive(current);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
    // `stops` is derived from constants; it never changes between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="atlas-home legal-home bot-home">
      <HomeHeader />

      <section className="legal-hero legal-container" aria-labelledby="bot-heading">
        <div className="legal-hero-copy">
          <span className="legal-eyebrow"><span /> FOR WEBSITE TEAMS</span>
          <h1 id="bot-heading">AluttaBot.<br /><em>Polite by design.</em></h1>
          <p>AluttaBot reads university websites so students can find the right researchers. Here is exactly what it does, and how to limit or block it.</p>
          <a className="legal-read-link" href="#block">Limit or block it <ArrowDown size={18} /></a>
        </div>
        <div className="legal-hero-art" aria-hidden="true">
          <div className="legal-orbit" />
          <div className="legal-paper">
            <span className="legal-paper-icon"><ScanSearch size={38} strokeWidth={1.4} /></span>
            <span className="legal-paper-label">ALUTTA · CRAWLER</span>
            <strong>{"Reads slowly.\nRespects robots.txt."}</strong>
            <i /><i /><i />
            <span className="legal-paper-seal"><Check size={16} /> One page a second, at most</span>
          </div>
          <span className="legal-art-note">Public staff and<br />department pages only.</span>
        </div>
      </section>

      <div className="legal-layout legal-container" id="bot-document">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-inner">
            <span className="legal-eyebrow">ON THIS PAGE</span>
            <nav aria-label="Page sections">
              {stops.map((stop, index) => (
                <a key={stop.id} href={`#${stop.id}`} aria-current={active === index ? "location" : undefined}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{stop.title}
                </a>
              ))}
            </nav>
            <div className="legal-sidebar-contact">
              <Mail size={20} />
              <strong>Seeing a problem?</strong>
              <p>Tell us the site and what you saw.</p>
              <a href={`mailto:${EMAIL}?subject=AluttaBot`}>Write to us <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </aside>

        <article className="legal-document" aria-labelledby="bot-document-heading">
          <header className="legal-document-header">
            <div className="legal-document-meta">
              <span>Last updated: <time dateTime="2026-09-15">September 15, 2026</time></span>
            </div>
            <h2 id="bot-document-heading">About AluttaBot</h2>
            <p>What Alutta’s web crawler is, what it reads, and how to control it on your website.</p>
          </header>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="legal-section">
              <div className="legal-section-title"><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
              {section.body.map((block, i) => <Render key={i} block={block} />)}
            </section>
          ))}

          <section id="contact" className="legal-section">
            <div className="legal-section-title"><span>{String(stops.length).padStart(2, "0")}</span><h2>Contact</h2></div>
            <p>Write to <a href={`mailto:${EMAIL}?subject=AluttaBot`}>{EMAIL}</a> with “AluttaBot” in the subject. Tell us the website, roughly when, and what you saw. We read every message, and we can stop visiting a site on request.</p>
          </section>

          <div className="legal-related">
            <span>Keep reading</span>
            <Link href="/researchers">For researchers<ArrowRight size={22} /></Link>
          </div>
        </article>
      </div>

      <section className="legal-contact legal-container">
        <div>
          <span className="legal-eyebrow">A QUESTION FROM YOUR TEAM?</span>
          <h2>Tell us.<br /><em>We will listen.</em></h2>
          <p>For anything about AluttaBot on your website, write to us and a person will reply.</p>
        </div>
        <a className="atlas-button lime" href={`mailto:${EMAIL}?subject=AluttaBot`}>{EMAIL} <ArrowUpRight size={20} /></a>
      </section>

      <CareersFooter topId="bot-heading" />
    </div>
  );
}
