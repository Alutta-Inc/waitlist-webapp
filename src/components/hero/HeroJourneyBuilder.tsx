"use client";

import WaitlistForm from "@/components/ui/WaitlistForm";

export default function HeroJourneyBuilder() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-brand-accent/10 text-brand-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
            Early Access
          </div>
          <h2 className="font-display font-medium text-2xl text-brand-dark mb-1">
            Start your journey
          </h2>
          <p className="text-gray-500 text-sm">
            Join the early access waitlist and start planning your study abroad journey with Alutta.
          </p>
        </div>

        <WaitlistForm variant="hero" source="hero" />
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        {[
          { text: "Secure & private" },
          { text: "Confirmation email" },
          { text: "Always free to join" },
        ].map(({ text }) => (
          <div key={text} className="flex items-center gap-1 text-xs text-gray-400">
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
