import type { Metadata } from "next";
import Link from "next/link";

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

export default function TermsPage() {
  return (
    <main className="bg-brand-bg">
      <section className="px-4 md:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm font-medium text-brand-accent hover:text-brand-dark transition-colors">
            Back to Alutta
          </Link>

          <div className="mt-8 mb-10">
            <p className="text-sm text-gray-500 mb-3">Last updated: May 13, 2026</p>
            <h1 className="font-display font-medium text-4xl sm:text-5xl text-brand-dark mb-5">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              These Terms govern your use of the Alutta website and early access waitlist.
              By using the website or joining the waitlist, you agree to these Terms.
            </p>
          </div>

          <div className="space-y-9">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display font-medium text-2xl text-brand-dark mb-3">
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
