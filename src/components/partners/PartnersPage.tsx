"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, BadgeCheck, Check, Mail, Printer, ShieldCheck, Sparkles } from "lucide-react";

import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";

/** alutta.com/partners: the partnership pack.
 *
 *  This is the document the partnerships desk sends an admissions office after
 *  a first conversation. Below the hero it is a DOCUMENT: the legal page's
 *  parts (numbered sections, sticky contents, contact band), and it prints to a
 *  clean PDF with the Print button, which is how most registrars will pass it
 *  to a colleague.
 *
 *  THE HERO IS THE HOME PAGE'S, not the legal page's. A registrar deciding
 *  whether to answer our email lands here first, and the paper-on-an-orbit hero
 *  of the policy pages told them they had opened a policy. So it is built from
 *  the home hero's own parts (the arch, the halo, the floating labels that
 *  lean away from the pointer), and what floats is the offer itself: free to
 *  join, paid on admission, you decide. The card's line changes every few
 *  seconds; with reduced motion it holds still on the first.
 *
 *  A PARTNERSHIP IS TECHNICAL. What we are looking for is a connection between
 *  the institution's admissions system and ours, so the page never offers a
 *  "no technical work" route. Submitting on the school's own page is described
 *  only as what happens until the connection is live.
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

/** What the hero's card says, one line at a time. The same four facts as
 *  "What it costs", so the hero promises nothing the pack does not. */
const promises: [string, string][] = [
  ["To join", "Nothing"],
  ["To be listed", "Nothing"],
  ["Per application", "Nothing"],
  ["Per successful admission", "A commission, agreed in writing"],
];

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
    title: "How our two systems connect",
    blocks: [
      { p: "A partnership with Alutta is a connection between your admissions system and ours. It carries two things: applications to you, and your decisions back to the student. Your technical team, or the vendor of your admissions system, builds it with us." },
      {
        ways: [
          {
            tag: "From Alutta to you",
            title: "Applications arrive in your system",
            body: "A complete application, with its documents, is delivered into the admissions system your office already works in, so nobody retypes anything and nothing arrives by email.",
            points: ["Built for the system you use: a national or shared portal, a commercial admissions system, or your own", "Planned and tested with your team before any real applicant is involved", "We are building the first of these connections now, with our first partners"],
          },
          {
            tag: "From you to Alutta",
            title: "Decisions and fees reach the student",
            body: "Your system tells Alutta what happened to each application: received, offer made, unsuccessful, withdrawn, and any fee that is due. The student sees it at once, in one place, and acts on it.",
            points: ["A small, documented interface with one key per institution", "Test keys and a sandbox with made-up applicants, so nothing real is touched while you build", "Live keys only after the connection is proven in both directions"],
          },
        ],
      },
      { p: "We will be plain about where this stands. The interface for decisions and fees is ready today. The connection that delivers applications is built for each admissions system, and none is live yet, which is why we are choosing our first partners carefully. Until yours is live, students prepare everything on Alutta and submit on your own application page, so recruiting can begin before the work is finished." },
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
          { title: "An introductory call", body: "Twenty minutes. We hear how your office works today and which admissions system you use, and we answer your questions plainly." },
          { title: "Terms and agreement", body: "We agree the commercial terms and sign one agreement. Nothing is listed before it is signed." },
          { title: "Your listing", body: "We build your listing from what you publish. You review it." },
          { title: "Connecting our systems", body: "Your technical team receives the integration guide and test keys, builds and tries everything in the sandbox, and gets live keys once the connection is proven in both directions." },
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
          { q: "Do we have to change our admissions process?", a: "No. You assess and decide exactly as you do now. The connection carries applications in and decisions out. It does not change who decides, or how." },
          { q: "Do we need technical staff?", a: "Yes. A partnership connects your admissions system to ours, so we need a developer on your side, or the vendor of your admissions system. It is a contained piece of work: we supply the integration guide, test keys and a sandbox, and we stay with your team until it is live." },
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
  const [promise, setPromise] = useState(0);
  const heroVisual = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setPromise((at) => (at + 1) % promises.length), 2800);
    return () => window.clearInterval(timer);
  }, []);
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

      <section className="atlas-hero atlas-container partners-hero" aria-labelledby="partners-heading">
        <div className="atlas-hero-copy">
          <p className="atlas-eyebrow"><span /> FOR INSTITUTIONS</p>
          <h1 id="partners-heading"><span className="atlas-title-line">One profile.</span><span className="atlas-title-line">Every border.</span><em className="atlas-title-line">Your next intake.</em></h1>
          <p className="atlas-hero-intro">Alutta lets a student apply to any partner institution, anywhere in the world, with one application profile. Joining costs an institution nothing.</p>
          <div className="atlas-hero-buttons">
            <a className="atlas-button" href={CALL}>Arrange a call <ArrowUpRight size={21} /></a>
            <a className="partners-hero-read" href="#partners-document">Read the partnership pack <ArrowDown size={18} /></a>
          </div>
          <div className="atlas-small-promise"><ShieldCheck size={17} /><span>Your office assesses and decides every application.</span></div>
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
          <div className="atlas-image-arch"><Image src="/images/campus-friends.png" alt="Three students from different countries talking as they walk across a university campus" fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <div className="atlas-orbit-label"><Sparkles size={20} /> FREE TO JOIN</div>
          <div className="atlas-flight-label"><BadgeCheck size={19} /><span>You pay only<strong>On a successful admission</strong></span></div>
          <div className="atlas-destination-preview partners-hero-card">
            <span className="atlas-destination-question">What a partnership costs</span>
            <div className="partners-hero-line"><span key={promise}>{promises[promise][0]}<strong>{promises[promise][1]}</strong></span></div>
            <div className="partners-hero-dots" aria-hidden="true">{promises.map((item, index) => <i key={item[0]} data-on={index === promise} />)}</div>
          </div>
          <span className="atlas-photo-caption">An illustration, not a partner campus.</span>
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
