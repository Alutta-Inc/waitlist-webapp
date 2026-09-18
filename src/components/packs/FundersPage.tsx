"use client";

import PackPage, { EMAIL, type Pack, type Section } from "@/components/packs/PackPage";

/** alutta.com/funding-bodies: the pack for whoever helps a student pay: a
 *  scholarship body, a foundation, a government scheme, an employer who
 *  sponsors, a university's own awards office, a student lender. The page
 *  itself is PackPage; this is only what it says.
 *
 *  EVERY SENTENCE HERE IS SOMETHING THE PRODUCT DOES TODAY, or is marked as not
 *  built. Checked against funding-service and student-service on 2026-09-18:
 *    - awards are listed and kept by Alutta's editors from the body's own page,
 *      each with its source and the day it was checked;
 *    - matching is automatic, on where the student is applying and at what
 *      level, then criterion by criterion; there is NO score or probability,
 *      on purpose, and no matching on field of study;
 *    - the decisions interface (award-intake, alfb- keys, sandbox) is live;
 *    - NOTHING delivers an application into a funder's system yet, so students
 *      apply on the funder's own page;
 *    - Alutta charges a funding body nothing and never moves award money;
 *    - a funder is shown nothing about admissions, and there is no reporting.
 *  Change a claim here only when the product changed first. */

const sections: Section[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    blocks: [
      { p: "Alutta is a platform for students who want to study in another country. A student builds one application profile, uses it to apply to institutions, and plans in the same place how the whole thing will be paid for: tuition, living costs, travel, health cover, application and visa fees." },
      { p: "That plan is where your funding belongs. Most students never hear of most of the awards they qualify for, and most funders spend a great deal of effort reaching students who turn out not to qualify. We are a new company, our first students are in Nigeria, and we are choosing our first funding partners now." },
    ],
  },
  {
    id: "who-this-is-for",
    title: "Who this is for",
    blocks: [
      { p: "Anyone who helps a student pay. We use the words funding body for all of them." },
      {
        list: [
          "Scholarship bodies, foundations and trusts.",
          "Government and intergovernmental schemes.",
          "Universities’ own scholarship and bursary offices.",
          "Employers and sponsors who fund a person’s study.",
          "Student lenders. Loans are shown as loans, with their terms, and are never counted as money a student has been given.",
        ],
      },
    ],
  },
  {
    id: "what-you-gain",
    title: "What listing your funding gives you",
    blocks: [
      {
        list: [
          "The right students, not more students. An award is shown to a student because of where they are actually applying and at what level: an award tied to one institution, a region or a country reaches the students headed there, and a portable award reaches everyone it can follow.",
          "Your criteria, applied honestly. Each criterion you set, such as nationality, country of residence, destination, level of study or age, is checked against the student’s own profile, one by one, and the student sees which they meet and which they do not.",
          "No false promises in your name. We never show a student a score or a probability of winning. We show what the award covers, what you ask for, and the date you close.",
          "Applicants who know what they are applying for. Your deadline, your opening date, your decision date, the documents you require and the steps of your process are part of the listing, so a student arrives at your form prepared.",
        ],
      },
    ],
  },
  {
    id: "your-listing",
    title: "Your listing",
    blocks: [
      { p: "We build your listing from what you already publish, and our editors keep it current: what the award is, who it is for, what it covers line by line and in which currency, how many awards you make, your dates, your documents and your terms. Every listing carries the page it came from and the day we last checked it, and a student sees both." },
      { p: "You review your listing before it goes live, and you can ask for a correction at any time. Today our editors make the changes. You do not yet have a sign-in of your own to edit a listing." },
    ],
  },
  {
    id: "how-it-works",
    title: "How our two systems connect",
    blocks: [
      { p: "Listing your funding needs no technical work at all. A connection between your system and ours is the second step, for funders who want their decisions to reach students the moment they are made." },
      {
        ways: [
          {
            tag: "From you to Alutta",
            title: "Your decisions reach the student",
            body: "Your system tells Alutta what happened to each applicant: shortlisted, offered, awarded or unsuccessful, the amount and currency, and the date you need an answer by. The student sees it at once, inside their funding plan, and acts on it.",
            points: ["A small, documented interface with one key per funding body", "Test keys and a sandbox with made-up applicants, so nothing real is touched while you build", "Live keys only after the connection is proven in both directions"],
          },
          {
            tag: "From Alutta to you",
            title: "Applications arrive in your system",
            body: "A student applies for your award from the profile they have already built, and the application is delivered into the system your team works in.",
            points: ["Built for the system you use, with your team", "Not live yet for any funder", "Until it is, students apply on your own application page, prepared by your listing"],
          },
        ],
      },
      { p: "We will be plain about where this stands. The interface for decisions is ready today. Delivering applications into a funder’s system is not built yet, and we will build the first of those connections with our first partners." },
    ],
  },
  {
    id: "what-it-costs",
    title: "What it costs",
    blocks: [
      {
        terms: [
          { label: "To be listed", value: "Nothing" },
          { label: "Per applicant", value: "Nothing" },
          { label: "From the award", value: "Nothing" },
        ],
      },
      { p: "We do not charge funding bodies. We take no share of an award, and award money never passes through Alutta: you pay your scholars exactly as you do today. Funding is why many of our students can study at all, so your awards being easy to find is worth more to us than a fee." },
    ],
  },
  {
    id: "student-information",
    title: "Students’ information, and what we do not show you",
    blocks: [
      { p: "A student decides what to apply for, and their information goes only where they apply. We do not sell personal information, and we do not pass students’ details to anyone in return for payment." },
      { p: "We do not show a funder a student’s applications to institutions, or the decisions on them. If your award depends on an offer of admission, you confirm that with the student as you do now." },
      { p: "We do not yet offer funders reports on applicants or outcomes. If there is something you need to see in order to work with us, tell us on a call. It will shape what we build." },
    ],
  },
  {
    id: "getting-started",
    title: "From a first call to a first applicant",
    blocks: [
      {
        steps: [
          { title: "An introductory call", body: "Twenty minutes. We hear who your funding is for and how you select, and we answer your questions plainly." },
          { title: "Your listing", body: "We build your listing from what you publish. You review it before any student sees it." },
          { title: "Students find you", body: "Your award appears in the funding plans of the students it fits, with your dates and your requirements." },
          { title: "Connecting our systems, when you are ready", body: "Your technical team receives the integration guide and test keys, tries everything in the sandbox, and gets live keys once the connection is proven." },
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
          { q: "Do you choose who gets our award?", a: "No. You select exactly as you do now. Alutta shows your award to students it fits and tells them what you ask for. It never ranks, scores or recommends an applicant to you." },
          { q: "Do we need technical staff?", a: "Not to be listed. Connecting your system, so that your decisions reach students at once, needs a developer on your side for a contained piece of work, which we support throughout." },
          { q: "Does any of the money come through Alutta?", a: "No. We record what you tell us you have awarded, so the student’s plan is accurate. We never hold or move award money." },
          { q: "How many students do you have?", a: "We are new, and we will give you the real figures on a call instead of rounding them up on a page." },
          { q: "Who do we talk to?", a: `The partnerships desk, at ${EMAIL}. A person answers.` },
        ],
      },
    ],
  },
];

const pack: Pack = {
  path: "funding-bodies",
  eyebrow: "FOR FUNDING BODIES",
  heading: ["Your funding.", "The right students.", "The right moment."],
  intro: "Alutta shows your scholarships, grants and loans to the students they were made for, while they are planning how to pay for their studies. Listing costs a funding body nothing.",
  promise: "You select every scholar. Award money never passes through us.",
  // See public/images/funding-bodies-hero.prompt.txt: the picture this page is waiting for.
  image: { src: "/images/journey-graduates.jpg", alt: "Graduates in gowns throwing their caps into the air at sunset", position: "50% center" },
  caption: "The day your funding is for.",
  orbit: "FREE TO LIST",
  flight: ["We never touch", "Your award money"],
  // The same three facts as "What it costs", so the hero promises nothing the pack does not.
  card: {
    heading: "What it costs a funder",
    lines: [["To be listed", "Nothing"], ["Per applicant", "Nothing"], ["From the award", "Nothing"]],
  },
  document: {
    title: "Funding partner pack",
    lead: "What Alutta is, what listing your funding gives you, how it works, and what it costs. Written for scholarship, sponsorship and student finance teams.",
    contents: "IN THIS PACK",
  },
  updated: { iso: "2026-09-18", label: "September 18, 2026" },
  sections,
  links: [],
  contact: { heading: ["Twenty minutes,", "no obligation."], body: "Tell us who your funding is for, and ask us anything. A person at the partnerships desk answers." },
  callSubject: "An introductory call with Alutta, about funding",
};

export default function FundersPage() {
  return <PackPage pack={pack} />;
}
