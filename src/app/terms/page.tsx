import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms for using Alutta and joining the early access waitlist.",
};

const sections = [
  {
    title: "Early Access Status",
    body: [
      "Alutta is currently in an early access and pre-launch stage. Joining the waitlist does not guarantee access, timing of access, availability of any feature, or continued availability of the waitlist.",
      "We may change, pause, restrict, or discontinue any part of the website, waitlist, or early access program at any time.",
    ],
  },
  {
    title: "No Professional Advice",
    body: [
      "Information on Alutta is provided for general planning and educational purposes only.",
      "Alutta does not provide immigration advice, legal advice, financial advice, tax advice, or university admissions advice. You should consult qualified professionals or official institutions before making decisions.",
    ],
  },
  {
    title: "No Guarantees",
    body: [
      "Alutta does not guarantee university admission, visa approval, scholarship awards, travel eligibility, payment availability, exchange rates, housing availability, or any other outcome.",
      "Any examples, estimates, timelines, or savings claims are illustrative and may change based on user circumstances, provider availability, market conditions, and third-party rules.",
    ],
  },
  {
    title: "User Responsibilities",
    body: [
      "You agree to provide accurate information when joining the waitlist or using the website.",
      "You are responsible for keeping your own records, checking official deadlines, and confirming requirements with universities, governments, banks, payment providers, and other relevant institutions.",
    ],
  },
  {
    title: "Acceptable Use",
    body: [
      "You may not use bots, scripts, fake identities, abusive referrals, scraping tools, or other automated methods to submit waitlist entries or interfere with Alutta.",
      "We may remove entries, block requests, or restrict access when we believe there is spam, abuse, fraud, security risk, or misuse.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "Alutta may rely on third-party providers for database hosting, email delivery, bot protection, analytics, payments, travel support, settlement support, and other services.",
      "Those services may have their own terms, privacy policies, fees, eligibility requirements, and availability limits.",
    ],
  },
  {
    title: "Intellectual Property",
    body: [
      "The Alutta name, website, design, copy, product concepts, graphics, and related materials belong to Alutta or its licensors.",
      "You may not copy, reproduce, sell, or misuse Alutta materials without written permission.",
    ],
  },
  {
    title: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, Alutta will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the website or waitlist.",
      "The website and waitlist are provided on an as-is and as-available basis during this early stage.",
    ],
  },
  {
    title: "Changes To These Terms",
    body: [
      "We may update these Terms as Alutta evolves. If we make material changes, we will update the date on this page and may notify waitlist members when appropriate.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions about these Terms, contact us at hello@alutta.com.",
    ],
  },
];

export default function Page() { return <LegalPage kind="terms" sections={sections} />; }
