import type { Metadata } from "next";
import { Mail, ShieldCheck, Users } from "lucide-react";

import WaitlistCard from "@/components/waitlist/WaitlistCard";
import { APP_URL } from "@/lib/site";

// The one place a person joins the waitlist. The homepage used to carry the
// form in its hero, which made alutta.com read as a signup funnel rather than
// as the company; every "join" link on the site now lands here, and the
// referral link people share (?ref=CODE) points here too.
export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Get early access to Alutta. Tell us where you are and where you want to study, and we will email you when it is your turn.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    title: "Join the Alutta waitlist",
    description:
      "Early access to the platform that maps, funds and manages your study abroad journey.",
    type: "website",
  },
};

const STEPS = [
  {
    icon: Mail,
    title: "You get a confirmation",
    body: "An email lands straight away with your place on the list and your own early access link.",
  },
  {
    icon: Users,
    title: "We open access in small groups",
    body: "We invite people in batches so every new student gets real attention, and we email you when it is your turn.",
  },
  {
    icon: ShieldCheck,
    title: "Nobody will ask you for money",
    body: "Joining is free. We never ask for payment by transfer to an individual, and we will never message you asking for card details.",
  },
];

export default function WaitlistPage() {
  return (
    <main className="bg-white">
      <section
        style={{
          background:
            "linear-gradient(180deg, #FFFFEB 0%, #FFFFEB 40%, rgba(19,202,88,0.10) 100%)",
        }}
      >
        {/* Three blocks, two columns. On a phone the order is intro, form,
            then what happens next: the form is what the page is for, and it
            should not sit under three paragraphs of reassurance. On a wide
            screen the intro and the steps stack on the left and the form
            holds the right. */}
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-x-20 lg:gap-y-10 items-start">
            <div className="lg:pt-6 lg:col-start-1 lg:row-start-1">
              <span className="inline-block text-sm font-semibold text-brand-dark bg-brand-turbo/50 rounded-full px-4 py-1.5 mb-6">
                Now in private beta
              </span>
              <h1 className="font-display font-bold text-brand-dark text-4xl md:text-6xl leading-[1.05] tracking-tight text-balance">
                Get early access to{" "}
                <span className="text-brand-primary">Alutta</span>.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-brand-iridium/80 max-w-xl leading-relaxed font-medium">
                One place to map your study abroad journey, pay what your school
                asks for, and settle in when you land. We are letting students in
                a few at a time, and the list is how you get a place.
              </p>
            </div>

            <div id="join" className="flex justify-center lg:justify-end lg:col-start-2 lg:row-start-1 lg:row-span-2">
              <WaitlistCard />
            </div>

            <div className="lg:col-start-1 lg:row-start-2">
              <ol className="space-y-6">
                {STEPS.map((step) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="shrink-0 w-11 h-11 rounded-2xl bg-brand-turbo/25 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-brand-dark" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="font-display font-bold text-brand-dark text-lg leading-snug">
                        {step.title}
                      </p>
                      <p className="mt-1 text-base text-brand-iridium/80 leading-relaxed font-medium">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-10 text-sm text-brand-iridium/70 font-medium">
                Already a student on Alutta?{" "}
                <a
                  href={`${APP_URL}/signin`}
                  data-track="cta-signin"
                  className="text-brand-dark font-semibold underline underline-offset-4 hover:text-brand-primary transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
