"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Handshake, Mail, Printer } from "lucide-react";

import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";

/** alutta.com/partners: the partnership pack.
 *
 *  This is the document the partnerships desk sends an admissions office after
 *  a first conversation, so it is a DOCUMENT first and a web page second: built
 *  from the legal page's parts (hero, numbered sections, sticky contents,
 *  contact band), and it prints to a clean PDF with the Print button, which is
 *  how most registrars will pass it to a colleague.
 *
 *  EVERY SENTENCE HERE IS SOMETHING THE PRODUCT DOES TODAY, or is marked as
 *  something we build with the partner. A registrar will hold us to this page
 *  on the first call. So: no student numbers, no partner names, no commission
 *  rate (the desk confirms those in conversation), and where a thing is not
 *  built yet, the page says so. Change a claim here only when the product
 *  changed first. */

const EMAIL = "partnerships@alutta.com";
const CALL = `mailto:${EMAIL}?subject=${encodeURIComponent("An introductory call with Alutta")}`;

type Block =
  | { p: string }
  | { list: string[] }
  | { ways: { tag: string; title: string; body: string; points: string[] }[] }
  | { terms: { label: string; value: string }[] }
  | { steps: { title: string; body: string }[] }
  | { asked: { q: string; a: string }[] };

type Section = { id: string; title: string; blocks: Block[] };

const RESEARCHERS_PAGE = "how it treats researchers";

const sections: Section[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    blocks: [
      { p: "Alutta is a platform for students who want to study in another country. A student builds one application profile, and uses it to apply to any partner institution, anywhere in the world. The same place then carries them through what follows: the decision, the fees, the visa and the move." },
      { p: "We are a new company, and we would rather say so than imply otherwise. Our first students are in Nigeria. We are opening by invitation, and we are choosing our first partner institutions now. On a call we will tell you exactly where we are, in numbers." },
    ],
  },
  {
    id: "what-you-gain",
    title: "What a partnership gives you",
    blocks: [
      {
        list: [
          "Applications from international students in countries where your office does not recruit today, without opening an office, attending a fair or appointing anyone there.",
          "Complete applications. A student cannot send an application until every section your level of study requires is filled in and the documents it names are actually on file. The student certifies it, and any later edit clears that certification.",
          "Applications only when you are open. Your intakes and application windows are part of your listing, and an application outside an open window is refused before it reaches you.",
          "No change to how you decide. Your office assesses every application by its own standards and makes every decision. Alutta never decides, and never advises a student on your behalf.",
        ],
      },
    ],
  },
  {
    id: "how-it-works",
    title: "Two ways to work with us",
    blocks: [
      { p: "You choose how applications reach you. Most institutions begin with the first and move to the second when it suits their team." },
      {
        ways: [
          {
            tag: "No technical work",
            title: "Keep your own application form",
            body: "We list your programmes. The student prepares everything on Alutta, then we hand them to your own application page to submit, with their profile and documents ready beside them.",
            points: ["Nothing to install or build", "Your form, your portal, your process", "Can start as soon as we have an agreement"],
          },
          {
            tag: "With your technical team",
            title: "Connect your admissions system",
            body: "Your system tells Alutta what happened to each application: received, offer made, unsuccessful, withdrawn, and any fee that is due. The student sees it at once, in one place, and acts on it.",
            points: ["A small, documented interface with one key per institution", "Test keys and a sandbox with made-up applicants, so nothing real is touched while you build", "Live keys only after the connection is proven in both directions"],
          },
        ],
      },
      { p: "Sending applications directly into an admissions portal is built portal by portal, with the partner who uses it. No portal connection is live yet, so if this matters to you, tell us which system you use and we will plan it with your team." },
    ],
  },
  {
    id: "what-it-costs",
    title: "What it costs",
    blocks: [
      {
        terms: [
          { label: "To join", value: "Nothing" },
          { label: "To be listed", value: "Nothing" },
          { label: "Per application", value: "Nothing" },
          { label: "Per successful admission", value: "A commission, agreed in writing" },
        ],
      },
      { p: "Alutta earns a commission only when a student is successfully admitted from an application made through Alutta. If nobody is admitted, you pay nothing. The rate, and exactly what counts as a successful admission, are set out in the agreement we sign with you before anything goes live." },
    ],
  },
  {
    id: "fees-and-payments",
    title: "Fees and payments, if you want them",
    blocks: [
      { p: "This part is optional. Where you ask us to, a student can pay what you bill them through Alutta: an application fee, a deposit, tuition, accommodation or insurance. They pay in the currency you billed, which for many of our students means paying in their own currency from their own bank, instead of arranging an international transfer." },
      { p: "We collect only fees that you have sent us, for the amount you stated. What we collect is remitted to you in batches, and each payment arrives with a remittance advice that lists every student it covers, your own application reference, the fee, the amount and the date it was paid." },
      { p: "We collect nothing without a collection clause signed by you. Without one, students pay on your own payment page or by your own instructions, as they do today." },
    ],
  },
  {
    id: "your-listing",
    title: "Your listing",
    blocks: [
      { p: "We build your listing from what you already publish, and we keep it current: your programmes by level of study, your costs, your intakes and your application windows. Every cost we show carries its source and the date we recorded it, so a student always knows where a figure came from, and so do you." },
      { p: "You review your listing before it goes live, and you can ask for a correction at any time." },
    ],
  },
  {
    id: "research-degrees",
    title: "Research degrees",
    blocks: [
      { p: "Applicants for a PhD or a research master’s usually need a supervisor’s support before they apply. Alutta’s Supervisor Finder shows a student the researchers at an institution they are applying to whose recent work matches their own interests, drawn from the published record and your own website." },
      { p: `It is built to be respectful of your academics: a student sees one institution at a time, lists cannot be exported, and any researcher can ask to be left out. We publish ${RESEARCHERS_PAGE}.` },
    ],
  },
  {
    id: "student-information",
    title: "Students’ information",
    blocks: [
      { p: "A student decides where to apply, and their information goes only where they apply. We do not sell personal information, and we do not pass applicants’ details to anyone in return for payment." },
      { p: "Data protection terms are part of the agreement we sign with you. Tell us what your institution requires, and we will work to it." },
    ],
  },
  {
    id: "getting-started",
    title: "From a first call to a first application",
    blocks: [
      {
        steps: [
          { title: "An introductory call", body: "Twenty minutes. We hear how your office works today and answer your questions plainly." },
          { title: "Terms and agreement", body: "We agree the commercial terms and sign one agreement. Nothing is listed before it is signed." },
          { title: "Your listing", body: "We build your listing from what you publish. You review it." },
          { title: "Connecting, if you choose to", body: "Your technical team receives the integration guide and test keys, tries everything in the sandbox, and gets live keys once the connection is proven." },
          { title: "A go-live date", body: "We agree the date together, ahead of the intake you want to recruit for." },
        ],
      },
    ],
  },
  {
    id: "questions",
    title: "Questions we are asked",
    blocks: [
      {
        asked: [
          { q: "Do we have to change our admissions process?", a: "No. You assess and decide exactly as you do now. If you keep your own application form, nothing changes at all." },
          { q: "Do we need technical staff?", a: "Not to begin. Keeping your own application form needs none. Connecting your admissions system needs a developer for a short piece of work, which we support throughout." },
          { q: "How many students and partners do you have?", a: "We are new, and we will give you the real figures on a call instead of rounding them up on a page." },
          { q: "What do we pay if nobody is admitted?", a: "Nothing." },
          { q: "Who do we talk to?", a: `The partnerships desk, at ${EMAIL}. A person answers.` },
        ],
      },
    ],
  },
];

function Paragraph({ text }: { text: string }) {
  if (text.includes(RESEARCHERS_PAGE)) {
    const [before, after] = text.split(RESEARCHERS_PAGE);
    return <p>{before}<Link href="/researchers">{RESEARCHERS_PAGE}</Link>{after}</p>;
  }
  if (!text.includes(EMAIL)) return <p>{text}</p>;
  const [before, after] = text.split(EMAIL);
  return <p>{before}<a href={`mailto:${EMAIL}`}>{EMAIL}</a>{after}</p>;
}

function Body({ block }: { block: Block }) {
  if ("p" in block) return <Paragraph text={block.p} />;
  if ("list" in block)
    return (
      <ul className="partners-list">
        {block.list.map((item) => <li key={item}><Check size={16} aria-hidden="true" /><span>{item}</span></li>)}
      </ul>
    );
  if ("ways" in block)
    return (
      <div className="partners-ways">
        {block.ways.map((way) => (
          <div key={way.title} className="partners-way">
            <span className="partners-tag">{way.tag}</span>
            <h3>{way.title}</h3>
            <p>{way.body}</p>
            <ul>{way.points.map((point) => <li key={point}>{point}</li>)}</ul>
          </div>
        ))}
      </div>
    );
  if ("terms" in block)
    return (
      <dl className="partners-terms">
        {block.terms.map((term) => <div key={term.label}><dt>{term.label}</dt><dd>{term.value}</dd></div>)}
      </dl>
    );
  if ("steps" in block)
    return (
      <ol className="partners-steps">
        {block.steps.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.body}</span></li>)}
      </ol>
    );
  return (
    <dl className="partners-asked">
      {block.asked.map((item) => <div key={item.q}><dt>{item.q}</dt><dd><Paragraph text={item.a} /></dd></div>)}
    </dl>
  );
}

export default function PartnersPage() {
  const [active, setActive] = useState(0);
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
  }, []);

  return (
    <div className="atlas-home legal-home partners-home">
      <HomeHeader />

      <section className="legal-hero legal-container" aria-labelledby="partners-heading">
        <div className="legal-hero-copy">
          <span className="legal-eyebrow"><span /> FOR INSTITUTIONS</span>
          <h1 id="partners-heading">One profile.<br /><em>Your next intake.</em></h1>
          <p>Alutta lets a student apply to any partner institution, anywhere in the world, with one application profile. Joining costs an institution nothing.</p>
          <a className="legal-read-link" href="#partners-document">Read the partnership pack <ArrowDown size={18} /></a>
        </div>
        <div className="legal-hero-art" aria-hidden="true">
          <div className="legal-orbit" />
          <div className="legal-paper">
            <span className="legal-paper-icon"><Handshake size={38} strokeWidth={1.4} /></span>
            <span className="legal-paper-label">ALUTTA · PARTNERSHIPS</span>
            <strong>{"Free to join.\nPaid on admission."}</strong>
            <i /><i /><i />
            <span className="legal-paper-seal"><Check size={16} /> You decide every application</span>
          </div>
          <span className="legal-art-note">Students you do not<br />reach today.</span>
        </div>
      </section>

      <div className="legal-layout legal-container" id="partners-document">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-inner">
            <span className="legal-eyebrow">IN THIS PACK</span>
            <nav aria-label="Pack sections">
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
              <a href={CALL}>Arrange a call <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </aside>

        <article className="legal-document" aria-labelledby="partners-document-heading">
          <header className="legal-document-header">
            <div className="legal-document-meta">
              <span>Last updated: <time dateTime="2026-09-18">September 18, 2026</time></span>
              <button onClick={() => window.print()} aria-label="Print the partnership pack, or save it as a PDF"><Printer size={17} />Print or save as PDF</button>
            </div>
            <h2 id="partners-document-heading">Partnership pack</h2>
            <p>What Alutta is, what a partnership gives your institution, how it works, and what it costs. Written for admissions and international offices.</p>
          </header>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="legal-section">
              <div className="legal-section-title"><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
              {section.blocks.map((block, at) => <Body key={at} block={block} />)}
            </section>
          ))}

          <p className="partners-print-contact">Alutta Partnerships · {EMAIL} · alutta.com/partners</p>
        </article>
      </div>

      <section className="legal-contact legal-container">
        <div>
          <span className="legal-eyebrow">THE NEXT STEP</span>
          <h2>Twenty minutes,<br /><em>no obligation.</em></h2>
          <p>Tell us how your office works today, and ask us anything. A person at the partnerships desk answers.</p>
        </div>
        <a className="atlas-button lime" href={CALL}>{EMAIL} <ArrowUpRight size={20} /></a>
      </section>

      <CareersFooter topId="partners-heading" />
    </div>
  );
}
