"use client";

import WaitlistForm from "@/components/ui/WaitlistForm";
import { STUDENT_SIGNIN_URL } from "@/lib/site";

/** The waitlist form in its card, with the three things a nervous first-time
 *  visitor wants to read before typing an email under it. This used to sit
 *  inside the homepage hero; it now has a page of its own, so the homepage can
 *  say what Alutta is without a form competing for the first look. */
export default function WaitlistCard() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
            Early access
          </div>
          <h2 className="font-display font-medium text-2xl text-brand-dark mb-1">
            Join the waitlist
          </h2>
          <p className="text-gray-500 text-sm">
            Tell us where you are and where you want to study. We open access in
            small groups and email you when it is your turn.
          </p>
        </div>

        <WaitlistForm variant="hero" source="waitlist" />

        {/* The other door, at the foot of the form where every sign-up form
            keeps it. The rule says "this is something else" without a heading,
            so it does not read as a second call to action. */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
          Already a student on Alutta?{" "}
          <a
            href={STUDENT_SIGNIN_URL}
            data-track="cta-signin"
            className="text-brand-dark font-semibold underline underline-offset-4 hover:text-brand-primary transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        {["Secure and private", "Confirmation email", "Always free to join"].map((text) => (
          <span key={text} className="text-xs text-gray-400">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
