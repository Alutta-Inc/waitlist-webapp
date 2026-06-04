import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how Alutta collects, uses, and protects waitlist information.",
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "When you join the waitlist, we collect the information you submit, such as your name, email address, country, intended study destination, program interest, referral code, and referrer code.",
      "We may also collect technical and usage information, including IP address, source page, UTM campaign data, browser metadata, and anti-spam verification results.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use waitlist information to manage early access, send product updates, confirm signups, prevent spam or abuse, track referrals, understand demand, and improve Alutta.",
      "We do not sell your personal information.",
    ],
  },
  {
    title: "Services We Use",
    body: [
      "We use trusted service providers to operate the waitlist and website, including Supabase for database storage, Resend for email delivery, Cloudflare Turnstile for bot protection, and hosting or analytics providers as needed.",
      "These providers may process information in countries outside your location, subject to their own security and compliance practices.",
    ],
  },
  {
    title: "Email Communications",
    body: [
      "By joining the waitlist, you agree to receive waitlist confirmations, product updates, early access invitations, and related Alutta communications.",
      "You can opt out of marketing communications at any time by using the unsubscribe option in our emails or contacting us.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We keep waitlist information for as long as needed to operate the waitlist, provide early access, prevent abuse, and meet legitimate business or legal needs.",
      "You may request deletion of your waitlist information, and we will respond within a reasonable time unless we need to retain certain information for security, legal, or operational reasons.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may request access, correction, or deletion of your personal information by contacting us.",
      "Depending on your location, you may have additional privacy rights under applicable data protection laws.",
    ],
  },
  {
    title: "Security",
    body: [
      "We use reasonable technical and organizational measures to protect waitlist information, including server-side access controls, bot protection, and service-provider security features.",
      "No online system is completely secure, so we cannot guarantee absolute security.",
    ],
  },
  {
    title: "Changes To This Policy",
    body: [
      "We may update this Privacy Policy as Alutta evolves. If we make material changes, we will update the date on this page and may notify waitlist members when appropriate.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions or requests, contact us at hello@alutta.com.",
    ],
  },
];

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              This Privacy Policy explains how Alutta collects, uses, stores, and protects information
              when you visit our website or join the early access waitlist.
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
