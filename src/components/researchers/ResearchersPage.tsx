"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, BookOpen, Check, Mail } from "lucide-react";

import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";
import RemovalForm from "@/components/researchers/RemovalForm";

/** alutta.com/researchers: what Supervisor Finder shows about researchers, and
 *  how to be left out.
 *
 *  Built from the legal page's parts (hero, numbered sections, sticky contents,
 *  contact band) because it is the same kind of page: something a person reads
 *  to understand what we do with information about them. The one thing the
 *  legal pages do not have is the removal form, which sits at the end of the
 *  document where "Your choice" leads to it.
 *
 *  The crawler section's anchor (#aluttabot) is the address in AluttaBot's user
 *  agent, so a university's web team following it lands on the paragraph that
 *  answers their question. */

type Section = { id: string; title: string; body: string[] };

const sections: Section[] = [
  {
    id: "what-it-is",
    title: "What Supervisor Finder is",
    body: [
      "Students applying for a PhD or a research master’s often need a supervisor to support their application before they apply. Supervisor Finder helps them find researchers at the universities they are applying to whose recent work matches their own research interests.",
      "It helps a student find the right person to write to. It is not a mailing list, and Alutta never contacts researchers on a student’s behalf.",
    ],
  },
  {
    id: "what-we-show",
    title: "What we show about you",
    body: [
      "Your name, your title and department, the research topics you publish in, and up to three of your recent papers.",
      "Where your university’s own website lists them, we also show your profile page and your work email address, with a link to the page we found them on.",
      "We never guess or construct an email address. We never show anything that your university’s website or your published record does not already state publicly.",
    ],
  },
  {
    id: "aluttabot",
    title: "Where it comes from",
    body: [
      "Your publication record comes from OpenAlex, an open index of scholarly works and the people who write them. We then read your university’s own website to confirm that you work there and to find your profile page.",
      "Our crawler identifies itself as AluttaBot. It reads only university websites, follows each site’s robots.txt, and fetches no more than one page a second from any site. To keep it off a website, disallow AluttaBot in that site’s robots.txt.",
    ],
  },
  {
    id: "how-students-see-it",
    title: "How students see it",
    body: [
      "A student sees the researchers at one university at a time, and only at universities they are applying to. Lists cannot be exported.",
      "We ask students to write to one researcher at a time, about that researcher’s own work, and to respect a reply of no. When a student stops applying to a university, they stop seeing its researchers.",
    ],
  },
  {
    id: "keeping-it-accurate",
    title: "Keeping it accurate",
    body: [
      "We refresh what we show at least every three months. Students can report an entry that is wrong, and when they do we correct it for every student.",
      "If something about you is out of date, write to hello@alutta.com and we will fix it.",
    ],
  },
  {
    id: "your-choice",
    title: "Your choice",
    body: [
      "You can ask to be removed at any time, using the form below. We send a link to your university email address to confirm that the request is yours. Once you confirm, you are removed from every student’s list the next time it is opened, and we do not list you again.",
      "We keep a record of your request, and only what we need to honour it. Depending on where you are, data protection law may give you further rights, including the right to object. This form is one way to use them. Writing to hello@alutta.com is another.",
    ],
  },
];

const EMAIL = "hello@alutta.com";

function Paragraph({ text }: { text: string }) {
  if (!text.includes(EMAIL)) return <p>{text}</p>;
  const [before, after] = text.split(EMAIL);
  return <p>{before}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{after}</p>;
}

export default function ResearchersPage() {
  // The contents list follows the reader, as on the legal pages. The form is
  // the last stop in it.
  const stops = [...sections.map((s) => ({ id: s.id, title: s.title })), { id: "remove", title: "Ask to be removed" }];
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
    <div className="atlas-home legal-home researchers-home">
      <HomeHeader />

      <section className="legal-hero legal-container" aria-labelledby="researchers-heading">
        <div className="legal-hero-copy">
          <span className="legal-eyebrow"><span /> FOR RESEARCHERS</span>
          <h1 id="researchers-heading">Your research.<br /><em>Your choice.</em></h1>
          <p>Students use Alutta to find researchers whose work matches their own. Here is what we show about you, where it comes from, and how to be left out.</p>
          <a className="legal-read-link" href="#remove">Ask to be removed <ArrowDown size={18} /></a>
        </div>
        <div className="legal-hero-art" aria-hidden="true">
          <div className="legal-orbit" />
          <div className="legal-paper">
            <span className="legal-paper-icon"><BookOpen size={38} strokeWidth={1.4} /></span>
            <span className="legal-paper-label">ALUTTA · RESEARCHERS</span>
            <strong>{"Open research.\nRespectful introductions."}</strong>
            <i /><i /><i />
            <span className="legal-paper-seal"><Check size={16} /> Removal on request</span>
          </div>
          <span className="legal-art-note">Found through<br />your published work.</span>
        </div>
      </section>

      <div className="legal-layout legal-container researchers-layout" id="researchers-document">
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
              <strong>A question first?</strong>
              <p>Write to us before you decide.</p>
              <a href={`mailto:${EMAIL}`}>Talk to us <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </aside>

        <article className="legal-document" aria-labelledby="researchers-document-heading">
          <header className="legal-document-header">
            <div className="legal-document-meta">
              <span>Last updated: <time dateTime="2026-09-15">September 15, 2026</time></span>
            </div>
            <h2 id="researchers-document-heading">Supervisor Finder, explained</h2>
            <p>How Alutta’s Supervisor Finder uses information about researchers, and the choice you have about it.</p>
          </header>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="legal-section">
              <div className="legal-section-title"><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
              {section.body.map((paragraph) => <Paragraph key={paragraph} text={paragraph} />)}
            </section>
          ))}

          <section id="remove" className="researchers-remove" aria-labelledby="remove-heading">
            <div className="researchers-remove-copy">
              <div className="legal-section-title"><span>{String(stops.length).padStart(2, "0")}</span><h2 id="remove-heading">Ask to be removed</h2></div>
              <p>It takes a minute. We will email your university address a link to confirm, and nothing changes until you open it.</p>
            </div>
            <div className="researchers-remove-card">
              <RemovalForm />
            </div>
          </section>
        </article>
      </div>

      <section className="legal-contact legal-container">
        <div>
          <span className="legal-eyebrow">STILL HAVE QUESTIONS</span>
          <h2>Good research<br /><em>deserves respect.</em></h2>
          <p>For anything about how Supervisor Finder uses information about researchers, write to us.</p>
        </div>
        <a className="atlas-button lime" href={`mailto:${EMAIL}`}>{EMAIL} <ArrowUpRight size={20} /></a>
      </section>

      <CareersFooter topId="researchers-heading" />
    </div>
  );
}
