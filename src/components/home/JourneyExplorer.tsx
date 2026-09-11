"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, GraduationCap, Heart, MapPin, Plane, ShieldCheck, Users } from "lucide-react";
import { SelectMenu } from "@/components/ui/SelectMenu";

const chapters = [
  { title: "Find your fit", text: "Find schools and programmes.", Icon: GraduationCap },
  { title: "Make it official", text: "Keep your school fees organised.", Icon: CreditCard },
  { title: "Get ready to go", text: "Plan your travel and arrival.", Icon: Plane },
];
// A curated interaction demo, independent of the live institution catalogue.
// Photographs show destinations, not university campuses or partner endorsements.
const samples = [
 {name:"Columbia University",city:"New York",country:"United States",image:"/images/destination-usa.jpg",imageAlt:"New York skyline, United States"},
 {name:"University College London",city:"London",country:"United Kingdom",image:"/images/destination-uk.jpg",imageAlt:"Tower Bridge and the River Thames in London, United Kingdom"},
 {name:"University of Toronto",city:"Toronto",country:"Canada",image:"/images/destination-canada.jpg",imageAlt:"Toronto skyline and CN Tower, Canada"},
 {name:"Fudan University",city:"Shanghai",country:"China",image:"/images/destination-china.jpg",imageAlt:"Shanghai skyline, China"},
 {name:"University of Sydney",city:"Sydney",country:"Australia",image:"/images/destination-australia.jpg",imageAlt:"Sydney Harbour and Opera House, Australia"},
];
export default function JourneyExplorer({ stage, onStageChange, onQuiz }: { stage: number; onStageChange: (stage: number) => void; onQuiz: () => void }) {
  const schools = samples;
  const countries = schools.map(s => s.country);
  const schoolTrack = useRef<HTMLDivElement>(null);
  const [scrollBounds, setScrollBounds] = useState({ start: true, end: false });
  function updateScrollBounds() {
    const track = schoolTrack.current;
    if (track) setScrollBounds({ start: track.scrollLeft <= 2, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 });
  }
  function slideSchools(direction: number) {
    const track = schoolTrack.current;
    if (!track) return;
    const card = track.querySelector('article');
    const distance = (card?.getBoundingClientRect().width ?? track.clientWidth) + 15;
    track.scrollBy({ left: direction * distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  const [country, setCountry] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const active = Math.min(stage, 2);
  const filtered = schools.filter(s => !country || s.country === country);
  useEffect(() => {
    const track = schoolTrack.current;
    if (!track) return;
    track.scrollLeft = 0;
    const observer = new ResizeObserver(updateScrollBounds);
    observer.observe(track);
    return () => observer.disconnect();
  }, [country, active]);
  const toggle = (name: string) => setSaved(values => values.includes(name) ? values.filter(v => v !== name) : [...values, name]);
  return <section className="journey-explorer" id="how-it-works" aria-labelledby="journey-title">
    <div className="journey-layout">
      <div className="journey-copy"><h2 id="journey-title">One journey.<br /><span>Every step, in one place.</span></h2><p className="journey-lede">From finding the right school to making payments and getting ready for your new life, Alutta helps you move forward with clarity and confidence.</p>
        <div className="journey-chapters" role="tablist" aria-label="Explore your journey" aria-orientation="vertical">{chapters.map(({ title, text, Icon }, index) => <button key={title} role="tab" id={`journey-tab-${index}`} aria-selected={active === index} aria-controls="journey-panel" tabIndex={active === index ? 0 : -1} onClick={() => onStageChange(index)} onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (active + (event.key === 'ArrowDown' ? 1 : 2)) % 3; onStageChange(next); document.getElementById(`journey-tab-${next}`)?.focus(); } }}><span className="journey-number">{index + 1}</span><span className="journey-chapter-icon"><Icon /></span><span className="journey-chapter-text"><strong>{title}</strong><small>{text}</small></span><span className="journey-chapter-arrow"><ArrowRight size={20} /></span></button>)}</div>
      </div>
      <div className="journey-visual"><div className="journey-backdrop" aria-hidden="true"><div className="journey-campus"><Image src="/images/journey-graduates.jpg" alt="" fill sizes="400px" /></div><span className="journey-handwritten">Your next chapter.</span></div>
        <div className="journey-panel" key={active} role="tabpanel" id="journey-panel" aria-labelledby={`journey-tab-${active}`}>
          <div className="journey-panel-heading"><div><h3>{['Find your fit, at your own pace.', 'Your fees. A little more clarity.', 'A new chapter, a clearer plan.'][active]}</h3></div><p>{['Explore schools and build your shortlist.', 'See what needs paying and keep every next step together.', 'Bring the essentials for your big move into one simple checklist.'][active]}</p></div>
          {active === 0 ? <div className="journey-search-window">
            <div className="journey-search-body">
              <div className="journey-demo-tools"><SelectMenu ariaLabel="Preview country" className="journey-country-menu" value={country} onChange={setCountry} options={[{value:"",label:"All countries"},...countries.map(c=>({value:c,label:c}))]}/><span aria-live="polite">{saved.length ? `${saved.length} saved in this preview` : "Your shortlist starts here"}</span></div>
              {active === 0 && <div className="journey-slider-controls" aria-label="School carousel controls"><button aria-label="Previous schools" aria-controls="selected-school-carousel" disabled={scrollBounds.start} onClick={() => slideSchools(-1)}><ArrowLeft size={18} /></button><button aria-label="Next schools" aria-controls="selected-school-carousel" disabled={scrollBounds.end || filtered.length === 0} onClick={() => slideSchools(1)}><ArrowRight size={18} /></button></div>}
              <div className="journey-school-grid journey-school-carousel" id="selected-school-carousel" role="region" aria-label="Selected schools" aria-roledescription="carousel" ref={schoolTrack} onScroll={updateScrollBounds} tabIndex={0}>{filtered.map((school) => <article className="journey-school" key={`${school.country}-${school.name}`}><div className="journey-school-photo"><Image src={school.image} alt={school.imageAlt} fill sizes="(max-width: 600px) 80vw, 360px" /><span className="journey-school-city">{school.country} view</span><button aria-label={`Save ${school.name}`} aria-pressed={saved.includes(school.name)} onClick={() => toggle(school.name)}><Heart size={17} fill={saved.includes(school.name) ? 'currentColor' : 'none'} /></button></div><div className="journey-school-copy"><h4>{school.name}</h4><p><MapPin size={12} />{school.city}, {school.country}</p></div></article>)}</div>

              <p className="journey-demo-note">Example institutions to demonstrate your shortlist.</p>
              <div className="journey-quiz"><Users /><div><strong>Not sure where to start?</strong><p>Find a starting point based on your goals.</p></div><button onClick={onQuiz}>Join the waitlist <ArrowRight size={16} /></button></div>
            </div></div> : <div className="journey-alternate"><span className="journey-example-label">INTERACTIVE PLANNING PREVIEW</span><div className="journey-alternate-banner">{active === 1 ? <ShieldCheck /> : <Plane />}<div><strong>{active === 1 ? 'Know what comes next.' : 'Make room for the adventure.'}</strong><p>{active === 1 ? 'Keep your fee details and payment instructions together.' : 'Small steps make a big move feel manageable.'}</p></div></div>{(active === 1 ? ['Review application fees', 'Check your offer deposit', 'Plan your tuition payment'] : ['Prepare your visa documents', 'Find your accommodation', 'Plan your flight and arrival']).map((task, index) => { const key = `${active}-${index}`; return <button className="journey-planning-task" key={task} aria-pressed={done.includes(key)} onClick={() => setDone(values => values.includes(key) ? values.filter(v => v !== key) : [...values, key])}><span>{done.includes(key) ? <Check size={17} /> : index + 1}</span><strong>{task}</strong><small>{done.includes(key) ? 'Explored' : 'Explore step'}</small></button>; })}<div className="journey-quiz"><Users /><div><strong>Your journey starts with you.</strong><p>Get early access to your next chapter.</p></div><button onClick={onQuiz}>Join the waitlist <ArrowRight size={16} /></button></div></div>}

        </div>
      </div>
    </div>
  </section>;
}
