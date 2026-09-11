import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe2, Mail, Sparkles, Users } from "lucide-react";
import WaitlistCard from "@/components/waitlist/WaitlistCard";
import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";
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


const steps = [
 {Icon: Mail, title: "You’re on the list.", text: "Look out for your confirmation email and your personal early access link."},
 {Icon: Users, title: "Your invitation is next.", text: "We’re opening access in small groups. We’ll email you when it’s your turn."},
 {Icon: Sparkles, title: "Make your next move.", text: "When you’re invited, start exploring Alutta and planning your study abroad journey."}
];
export default function WaitlistPage(){return <div className="atlas-home waitlist-home">
 <HomeHeader />
 <section className="waitlist-hero waitlist-container" aria-labelledby="waitlist-heading">
  <div className="waitlist-intro"><span className="waitlist-kicker"><i/> YOUR NEXT CHAPTER IS CALLING</span><h1 id="waitlist-heading">Big dreams.<br />New beginnings.<br /><em>You’re invited.</em></h1><p>A new campus. A new city. A whole new chapter. Join the waitlist for one place to plan your study abroad journey, from the first idea to your first day there.</p><div className="waitlist-promise"><span/>Private beta <i/>Free to join <i/>No pressure</div></div>
  <div className="waitlist-form-column" id="join"><WaitlistCard /></div>
  <div className="waitlist-visual"><div className="waitlist-photo"><Image src="/images/hero-campus.png" alt="Student holding a laptop and looking ahead on a university campus" fill priority sizes="(max-width: 800px) 90vw, 45vw" /></div><div className="waitlist-photo-note"><Globe2 size={25}/><span>Your world.<strong>A little bigger.</strong></span></div><span className="waitlist-photo-caption">A brighter you, anywhere.</span></div>
 </section>
 <section className="waitlist-destinations waitlist-container" aria-label="Our first study destinations"><span>WHERE WILL YOUR STORY GO?</span><div>{[['us','United States'],['gb','United Kingdom'],['ca','Canada'],['cn','China'],['au','Australia']].map(([code,name])=><span key={code}><Image src={`/images/flag-${code}.svg`} width={25} height={18} alt=""/>{name}</span>)}</div></section>
 <section className="waitlist-next waitlist-container" aria-labelledby="waitlist-next-heading"><div className="waitlist-next-heading"><div><span className="waitlist-kicker">ONE SMALL STEP TODAY</span><h2 id="waitlist-next-heading">And then?<br /><em>A little closer.</em></h2></div><p>No guesswork about what happens next. Here’s the journey from signing up to getting started.</p></div><ol>{steps.map(({Icon,title,text},index)=><li key={title}><div><span className="waitlist-step-icon"><Icon size={25}/></span><span className="waitlist-step-number">0{index+1}</span></div><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
 <section className="waitlist-explore waitlist-container"><div><span className="waitlist-kicker">WHILE YOU’RE HERE</span><h2>Picture what’s possible.</h2><p>Get to know the platform we’re building for your next chapter.</p></div><Link href="/#how-it-works" className="atlas-button lime">Take a look around <ArrowUpRight size={20}/></Link></section>
 <CareersFooter topId="waitlist-heading" />
 </div>;}
