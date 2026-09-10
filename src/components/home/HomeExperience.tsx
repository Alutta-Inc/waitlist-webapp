"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Globe2, House, MapPin, Plane, ShieldCheck, Users, ChartNoAxesColumnIncreasing, X } from "lucide-react";
import ExplainerModal from "./ExplainerModal";
import HomeHeader from "./HomeHeader";
import HomeBenefits from "./HomeBenefits";
import JourneyExplorer from "./JourneyExplorer";
import DestinationShowcase from "./DestinationShowcase";
import HomeClosing from "./HomeClosing";
import WaitlistForm from "@/components/ui/WaitlistForm";
import type { Showcase } from "@/lib/showcase";
import "./home.css";

const destinations = [
  { name: "United Kingdom", short: "UK", city: "London, Manchester & beyond", theme: "A little history. A whole new future.", detail: "Explore your university options, organise your application, and start making a place for yourself.", code: "GB", university: "Your UK university" },
  { name: "Canada", short: "Canada", city: "Toronto, Vancouver & beyond", theme: "New perspectives. Room to grow.", detail: "From choosing a programme to preparing for your first Canadian winter, bring every step into one plan.", code: "CA", university: "Your Canadian university" },
  { name: "United States", short: "USA", city: "Boston, New York & beyond", theme: "Find your campus. Make your mark.", detail: "Bring your school shortlist, application deadlines, and arrival essentials together in one place.", code: "US", university: "Your US university" },
  { name: "Australia", short: "Australia", city: "Sydney, Melbourne & beyond", code: "AU" },
  { name: "China", short: "China", city: "Shanghai, Beijing & beyond", code: "CN" },
];



export default function HomeExperience({ showcase }: { showcase: Showcase }) {
  const [destination, setDestination] = useState(0);
  const [stage, setStage] = useState(0);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heroVisual = useRef<HTMLDivElement>(null);
  const current = destinations[destination];
  function openPlanner() { setSignupSuccess(false); setSignupOpen(true); dialog.current?.showModal(); }
  return (
    <div className="atlas-home">
      <HomeHeader home onJoin={openPlanner} />

      <section className="atlas-hero atlas-container" aria-labelledby="atlas-heading">
        <div className="atlas-hero-copy">
          <p className="atlas-eyebrow"><span /> A BRIGHTER YOU, ANYWHERE</p>
          <h1 id="atlas-heading"><span className="atlas-title-line">Big dreams.</span><span className="atlas-title-line">New borders.</span><em className="atlas-title-line">One clear path.</em></h1>
          <p className="atlas-hero-intro">Alutta helps students discover schools, prepare applications, plan travel, and settle into a new city with more clarity.</p>
          <div className="atlas-hero-buttons"><button className="atlas-button" onClick={openPlanner}>Join the waitlist <ArrowUpRight size={21} /></button><ExplainerModal onJoin={openPlanner} /></div>
          <div className="atlas-small-promise"><ShieldCheck size={17} /><span>From your first idea to your first day there.</span></div>
        </div>
        <div className="atlas-hero-visual" ref={heroVisual}
          onPointerMove={(event) => {
            if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty("--hero-x", `${((event.clientX - rect.left) / rect.width - .5) * 10}px`);
            event.currentTarget.style.setProperty("--hero-y", `${((event.clientY - rect.top) / rect.height - .5) * 10}px`);
          }}
          onPointerLeave={() => { heroVisual.current?.style.setProperty("--hero-x", "0px"); heroVisual.current?.style.setProperty("--hero-y", "0px"); }}>
          <div className="atlas-hero-halo" aria-hidden="true" />
          <div className="atlas-image-arch"><Image src="/images/hero-campus.png" alt="A smiling student holding a laptop on a university campus" fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
          <div className="atlas-orbit-label"><Plane size={20} /> THE WORLD IS YOURS</div>
          <div className="atlas-flight-label"><Plane size={19} /><span>Next step<strong>Your next chapter</strong></span><ArrowRight size={20} className="atlas-flight-arrow" /></div>
          <div className="atlas-destination-preview"><span className="atlas-destination-question">Where will your story go?</span><div className="atlas-country-pills" aria-label="Choose a destination">{destinations.slice(0, 3).map((country, index) => <button key={country.code} className={destination === index ? "selected" : ""} onClick={() => setDestination(index)} aria-pressed={destination === index}><Image src={`/images/flag-${country.code.toLowerCase()}.svg`} alt="" width={22} height={16} />{country.short}</button>)}</div><div className="atlas-preview-bottom" aria-live="polite" key={current.code}><span><MapPin size={15} />{current.city}</span><a href="#destinations" aria-label={`Explore ${current.name}`}><ArrowUpRight size={20} /></a></div></div>
          <span className="atlas-photo-caption">A new place. Still, unmistakably you.</span>
        </div>
      </section>

      <HomeBenefits />

      <JourneyExplorer stage={stage} onStageChange={setStage} onQuiz={openPlanner} showcase={showcase} />

      <DestinationShowcase onExplore={(code) => { setDestination(destinations.findIndex(country => country.code.toLowerCase() === code)); openPlanner(); }} />

      <section className="atlas-manifesto" id="features" aria-labelledby="life-after-arrival-heading">
        <div className="atlas-arrival-wave atlas-arrival-wave-left" aria-hidden="true" />
        <div className="atlas-arrival-wave atlas-arrival-wave-right" aria-hidden="true" />
        <div className="atlas-container">
          <span className="atlas-manifesto-star" aria-hidden="true">&#10035;</span>
          <h2 id="life-after-arrival-heading">Go for the degree.<br /><em>Grow into your next chapter.</em></h2>
          <p>New friends, new routines, and a place that starts to feel like home. Alutta helps with the practical steps so you can focus on building your life abroad.</p>
          <button className="atlas-button lime" onClick={openPlanner}>Start your next chapter <ArrowUpRight size={20} /></button>
          <div className="atlas-arrival-cards">
            <div><span><House aria-hidden="true" /></span><strong>Settle in</strong></div>
            <div><span><Users aria-hidden="true" /></span><strong>Find your people</strong></div>
            <div><span><ChartNoAxesColumnIncreasing aria-hidden="true" /></span><strong>Build your future</strong></div>
          </div>
        </div>
      </section>

      <HomeClosing onJoin={openPlanner} />

      <dialog className="atlas-planner-dialog destination-planner waitlist-planner" ref={dialog} aria-labelledby="signup-title" onClose={() => setSignupOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="planner-layout">
          <aside className="planner-story signup-story">
            <div className="signup-story-brand"><Image src="/brand/logo-horizontal-coloured.svg" alt="Alutta" width={112} height={34} /><span>STUDY · PLAN · BELONG</span></div>
            <h2>Your next chapter<br /><em>starts here.</em></h2>
            <p>Join the waitlist for early access to personalised study abroad support, global opportunities, and a community that gets you.</p>
            <div className="signup-story-photo"><Image src="/images/hero-campus.png" alt="Student holding a laptop on a university campus" fill sizes="(max-width: 760px) 0px, 480px" /></div>
            <div className="signup-story-note"><Globe2 size={30} /><span>A brighter<br />tomorrow, globally.<small>STUDY WITHOUT LIMITS</small></span></div>
            <span className="signup-story-signature">Same students.<br />A bigger world.</span>
          </aside>
          <div className="atlas-planner-body signup-body">
            <button className="planner-close" aria-label="Close waitlist" onClick={() => dialog.current?.close()}><X size={25} /></button>
            <div className="signup-heading"><span className="signup-eyebrow">EARLY ACCESS <span className="signup-access-dots" aria-hidden="true"><i /><i /><i /></span></span><h2 id="signup-title">{signupSuccess ? 'A little closer to your future.' : 'Join the waitlist'}</h2>{!signupSuccess && <p>Tell us a bit about yourself and where you want to study.<br />We’ll email you when early access is open.</p>}</div>
            {signupOpen && <WaitlistForm source="homepage-modal" variant="hero" initialDestination={current.name} destinationNames={['United States', 'United Kingdom', 'Canada', 'China', 'Australia']} onSuccess={() => setSignupSuccess(true)} />}
            <div className="signup-dismiss"><button onClick={() => dialog.current?.close()}>Maybe later</button></div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
