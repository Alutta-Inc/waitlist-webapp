import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Compass, Globe2, HeartHandshake, Sparkles } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";
import { CareersRoles } from "@/components/careers/CareersRoles";
import { fetchRoles } from "@/lib/careers";
import "@/components/home/home.css";
import "./careers.css";
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


const values = [
 {Icon: Compass, title: "Start with the student.", text: "Behind every application is a person making a big decision. Build with their needs, questions, and ambitions in mind."},
 {Icon: Sparkles, title: "Make the complex feel simple.", text: "Bring clarity to the details. Thoughtful design and careful decisions can make a difficult journey easier."},
 {Icon: HeartHandshake, title: "Go further, together.", text: "Share what you know. Listen to a different perspective. The best work comes from people who care about the outcome."},
];
export default async function CareersPage() {
 const { roles, teams, failed } = await fetchRoles();
 return <div className="atlas-home careers-home">
  <HomeHeader />
  <section className="careers-hero atlas-container" aria-labelledby="careers-heading">
   <div className="careers-hero-copy"><span className="careers-kicker"><span /> CAREERS AT ALUTTA</span><h1 id="careers-heading">Build something<br />that takes people<br /><em>places.</em></h1><p>Big dreams deserve a clear path. Help us make studying, moving, and starting a new life abroad feel a little more possible.</p><div className="careers-hero-actions"><a href="#roles" className="atlas-button">Find your next role <ArrowUpRight size={20} /></a><a href="#our-purpose" className="careers-link">Meet the mission <ArrowDown size={18} /></a></div><span className="careers-hero-footnote">Your next chapter could change someone else’s.</span></div>
   <div className="careers-visual"><div className="careers-image-halo" /><div className="careers-main-photo"><Image src="/images/journey-graduates.jpg" alt="Graduates celebrating a new chapter together" fill priority sizes="(max-width: 760px) 90vw, 50vw" /></div><div className="careers-photo-label"><Globe2 size={22} /><span>Different perspectives.<strong>One shared purpose.</strong></span></div><span className="careers-photo-sticker">A WORLD OF<br />POSSIBILITY <ArrowUpRight size={27} /></span><div className="careers-image-caption"><span>FOR THE JOURNEYS AHEAD</span><span>↗</span></div></div>
  </section>
  <div className="careers-belief-strip"><span>Thoughtful by design.</span><i /><span>Human at heart.</span><i /><span>Global in ambition.</span></div>
  <section id="our-purpose" className="careers-purpose atlas-container"><div><span className="careers-kicker">THE WORK THAT MATTERS</span><h2>A brighter future.<br /><em>Built by us.</em></h2></div><div><p>Moving abroad is a big life moment. The school search, the paperwork, the payments, the first day in a new city. Too often, people have to figure it all out alone.</p><p>We’re bringing those steps together. At Alutta, the work is about helping people move forward with more clarity, confidence, and a sense of belonging.</p><Link className="careers-link" href="/#how-it-works">See what we’re building <ArrowUpRight size={20} /></Link></div></section>
  <section className="careers-values"><div className="atlas-container"><div className="careers-section-heading"><div><span className="careers-kicker">HOW WE BUILD</span><h2>Good people.<br />Work with purpose.</h2></div><p>A few ideas that guide the way we think, create, and move forward.</p></div><div className="careers-values-grid">{values.map(({Icon,title,text},i)=><article key={title}><div className="careers-value-top"><span><Icon size={26}/></span><small>0{i+1}</small></div><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
  <section className="careers-impact atlas-container"><div className="careers-impact-photo"><Image src="/images/campus-friends.png" alt="Students connecting on a university campus" fill sizes="(max-width: 760px) 90vw, 45vw" /></div><div className="careers-impact-copy"><span className="careers-kicker">MORE THAN A PRODUCT</span><h2>On the other side<br />of your work?<br /><em>A new beginning.</em></h2><p>A first acceptance. A journey planned. A place that starts to feel like home. That’s the bigger picture behind the details we build.</p><a href="#roles" className="careers-link">Be part of the story <ArrowUpRight size={20} /></a></div></section>
  <section className="careers-opportunities atlas-container" aria-labelledby="opportunities-heading"><div className="careers-section-heading"><div><span className="careers-kicker">YOUR NEXT CHAPTER</span><h2 id="opportunities-heading">Find your place<br /><em>in what’s next.</em></h2></div><p>Bring your curiosity, your perspective, and the things you do best. Explore opportunities to build with us.</p></div><CareersRoles roles={roles} teams={teams} failed={failed}/></section>
  <section className="careers-closing atlas-container"><Globe2 size={38} aria-hidden="true"/><h2>Big dreams need<br /><em>thoughtful people.</em></h2><p>There’s a whole world ahead. Let’s make it easier to reach.</p><a href="#roles" className="atlas-button lime">Explore opportunities <ArrowUpRight size={21}/></a><span className="careers-closing-orbit" aria-hidden="true"/></section>
  <CareersFooter />
 </div>;
}
