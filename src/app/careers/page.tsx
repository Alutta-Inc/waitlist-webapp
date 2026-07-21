import type { Metadata } from "next";
import { Globe, HeartHandshake, Rocket, Sparkles, TrendingUp, Users } from "lucide-react";

import { CareersRoles } from "@/components/careers/CareersRoles";
import { fetchRoles } from "@/lib/careers";

// This is the canonical careers home, the page that should rank for "Alutta
// careers". The job board's own root (careers.alutta.com) canonicalises here and
// is noindex, so the two do not compete. Roles refresh via the fetch's revalidate.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Careers at Alutta, build the future of relocation",
  description:
    "Join Alutta and help build the platform that makes moving countries actually work. See our open roles.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers at Alutta",
    description: "Help build the platform that makes moving countries actually work.",
    type: "website",
  },
};

// Honest, mission-grounded perks. General and true of an early-stage team, with
// no invented specifics. FOUNDER: sharpen these and add the real ones you can
// stand behind, such as health cover, leave, and a learning budget.
const PERKS = [
  {
    icon: Globe,
    title: "Build for the world",
    body: "Your work moves real people across real borders. There is no busywork here, only things that genuinely matter to someone.",
  },
  {
    icon: Rocket,
    title: "Real ownership",
    body: "You will own problems from beginning to end. It is a small team with a big scope, so you will have the room to make real decisions.",
  },
  {
    icon: TrendingUp,
    title: "Grow quickly",
    body: "Being early means the ceiling is high and close. You will stretch and learn faster here than you would in most other places.",
  },
  {
    icon: Users,
    title: "A team that cares",
    body: "We keep egos low and the craft high. We build hard things together, and we genuinely look out for one another along the way.",
  },
  {
    icon: HeartHandshake,
    title: "Flexibility that respects you",
    body: "We care about what you deliver, not the hours you keep. You are trusted to work in the way that brings out your very best.",
  },
  {
    icon: Sparkles,
    title: "A real stake",
    body: "You will hold equity in what we are building, because the people who build something valuable should own a piece of it.",
  },
];

export default async function CareersPage() {
  const { roles, teams, failed } = await fetchRoles();

  return (
    <main className="bg-white">
      {/* ── Hero ── continues the ivory header, then eases into a soft green. */}
      <section
        style={{
          background:
            "linear-gradient(180deg, #FFFFEB 0%, #FFFFEB 32%, rgba(19,202,88,0.10) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-20 md:pt-28 md:pb-28 text-center">
          <span className="inline-block text-sm font-semibold text-brand-dark bg-brand-turbo/50 rounded-full px-4 py-1.5 mb-6">
            Careers
          </span>
          <h1 className="font-display font-bold text-brand-dark text-4xl md:text-6xl leading-[1.05] tracking-tight max-w-4xl mx-auto">
            Come build the future of{" "}
            <span className="text-brand-primary">moving countries</span>.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-brand-iridium/80 max-w-3xl mx-auto leading-relaxed font-medium">
            We are a team on a mission to make relocation and studying abroad feel
            simple, honest, and within reach for millions of people. If that sounds like
            work worth doing, we would love to meet you.
          </p>
        </div>
      </section>

      {/* ── Roles (floating search + table) ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10">
        <CareersRoles roles={roles} teams={teams} failed={failed} />
      </section>

      {/* ── Perks ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-28 md:pb-36">
        <h2 className="font-display font-bold text-brand-dark text-3xl md:text-5xl max-w-2xl">
          Perks of being on the team
        </h2>
        <p className="mt-5 text-lg md:text-xl text-brand-iridium/80 font-medium">
          Beyond a competitive salary, here is some of what you get when you join us.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="bg-brand-bg-alt rounded-3xl p-8 border border-brand-iridium/8"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-turbo/25 flex items-center justify-center mb-5">
                <perk.icon className="w-6 h-6 text-brand-dark" />
              </div>
              <h3 className="font-display font-bold text-brand-dark text-xl mb-2.5">
                {perk.title}
              </h3>
              <p className="text-base text-brand-iridium/80 leading-relaxed font-medium">
                {perk.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
