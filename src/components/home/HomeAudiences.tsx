import Link from "next/link";
import { ArrowUpRight, GraduationCap, HandCoins, Landmark } from "lucide-react";

/** Who Alutta is for, on the home pages (Global and Nigeria).
 *
 *  The home page speaks to students, and should. But an admissions officer or
 *  a scholarship manager who receives our email looks us up and lands HERE, and
 *  until this section the site gave them nothing to recognise themselves in.
 *  So: one quiet band, late on the page, after the student's story is told.
 *  Three cards because an application has three sides: the student who makes
 *  it, the institution that decides it, and, often, the body that funds it.
 *
 *  A server component on purpose: three links need no script. */

const audiences = [
  { Icon: GraduationCap, tag: "FOR STUDENTS", title: "One profile, every application", body: "Build your profile once. Use it for every school and every award you apply to, then for everything that comes after.", cta: "Join the waitlist", href: "/waitlist" },
  { Icon: Landmark, tag: "FOR INSTITUTIONS", title: "One step away, not one more form", body: "Students apply to you with the profile they have already built. Complete applications, free to join, and you decide every one.", cta: "See how a partnership works", href: "/institutions" },
  { Icon: HandCoins, tag: "FOR FUNDING BODIES", title: "Your awards, in front of the right students", body: "Scholarships and grants shown to the students they were made for, at the moment they are planning how to pay.", cta: "See how funders work with us", href: "/funding-bodies" },
];

export default function HomeAudiences({ nigeria = false }: { nigeria?: boolean }) {
  return (
    <section className="audiences" aria-labelledby="audiences-heading">
      <div className="audiences-inner">
        <div className="audiences-heading">
          <span className="audiences-eyebrow"><i /> WHO ALUTTA IS FOR</span>
          <h2 id="audiences-heading">Every application<br /><em>has three sides.</em></h2>
          <p>A student applies. An institution decides. Often, somebody else helps to pay. Alutta is built for all three.</p>
        </div>
        <div className="audiences-grid">
          {audiences.map(({ Icon, tag, title, body, cta, href }) => (
            <Link key={tag} className="audience-card" href={nigeria && href === "/waitlist" ? "/ng/waitlist" : href}>
              <span className="audience-icon"><Icon size={24} strokeWidth={1.6} aria-hidden="true" /></span>
              <span className="audience-tag">{tag}</span>
              <strong>{title}</strong>
              <span className="audience-body">{body}</span>
              <span className="audience-cta">{cta} <ArrowUpRight size={17} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
