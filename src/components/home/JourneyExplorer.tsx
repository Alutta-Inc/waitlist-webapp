"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, GraduationCap, Heart, MapPin, Plane, Search, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { destinationImage, type Showcase } from "@/lib/showcase";

const chapters = [
  { title: "Find your fit", text: "Find schools and programmes.", Icon: GraduationCap },
  { title: "Make it official", text: "Keep your school fees organised.", Icon: CreditCard },
  { title: "Get ready to go", text: "Plan your travel and arrival.", Icon: Plane },
];
type ExplorerSchool = { name: string; image: string; imageAlt: string; city: string; country: string; tag: string; programmes: string[]; live: boolean };

// Illustrative cards, shown only while the catalogue has nothing to show.
// They are labelled as samples on the page, so a visitor is never told these
// three are partners.
const samples: ExplorerSchool[] = [
  { name: "University of Toronto", image: "/images/school-toronto.jpg", imageAlt: "Illustrative red-brick university campus", city: "Toronto, Canada", country: "Canada", tag: "Business", programmes: ["Management", "Computer Science", "Engineering"], live: false },
  { name: "University of Oxford", image: "/images/campus-friends.png", imageAlt: "Illustrative historic university courtyard", city: "Oxford, United Kingdom", country: "United Kingdom", tag: "Humanities", programmes: ["History", "Philosophy", "Computer Science"], live: false },
  { name: "University of Melbourne", image: "/images/hero-campus.png", imageAlt: "Student on a university campus", city: "Melbourne, Australia", country: "Australia", tag: "Science", programmes: ["Science", "Commerce", "Design"], live: false },
];

/** The catalogue's schools as explorer cards. The tag is the programme level
 *  (the catalogue has no field-of-study axis), and the photo is the
 *  destination's, since the catalogue carries no imagery. */
function fromShowcase(showcase: Showcase): ExplorerSchool[] {
  return showcase.schools.slice(0, 12).map((school) => ({
    name: school.name,
    image: destinationImage(school.countryCode),
    imageAlt: `${school.country}`,
    city: [school.city, school.country].filter(Boolean).join(", "),
    country: school.country,
    tag: school.levels[0] ?? "",
    programmes: school.programmes,
    live: true,
  }));
}

export default function JourneyExplorer({ stage, onStageChange, onQuiz, showcase }: { stage: number; onStageChange: (stage: number) => void; onQuiz: () => void; showcase: Showcase }) {
  const live = showcase.schools.length > 0;
  const schools = live ? fromShowcase(showcase) : samples;
  const countries = [...new Set(schools.map((s) => s.country))];
  const tags = [...new Set(schools.map((s) => s.tag).filter(Boolean))];
  const tagLabel = live ? "Level" : "Field of study";
  const [showFilters, setShowFilters] = useState(false);
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
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [field, setField] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const active = Math.min(stage, 2);
  const filtered = schools.filter(s => (!country || s.country === country) && (!field || s.tag === field) && `${s.name} ${s.city} ${s.programmes.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  useEffect(() => {
    const track = schoolTrack.current;
    if (!track) return;
    track.scrollLeft = 0;
    const observer = new ResizeObserver(updateScrollBounds);
    observer.observe(track);
    return () => observer.disconnect();
  }, [search, country, field, active]);
  const toggle = (name: string) => setSaved(values => values.includes(name) ? values.filter(v => v !== name) : [...values, name]);
  return <section className="journey-explorer" id="how-it-works" aria-labelledby="journey-title">
    <div className="journey-layout">
      <div className="journey-copy"><h2 id="journey-title">One journey.<br /><span>Every step, in one place.</span></h2><p className="journey-lede">From finding the right school to making payments and getting ready for your new life, Alutta helps you move forward with clarity and confidence.</p>
        <div className="journey-chapters" role="tablist" aria-label="Explore your journey" aria-orientation="vertical">{chapters.map(({ title, text, Icon }, index) => <button key={title} role="tab" id={`journey-tab-${index}`} aria-selected={active === index} aria-controls="journey-panel" tabIndex={active === index ? 0 : -1} onClick={() => onStageChange(index)} onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (active + (event.key === 'ArrowDown' ? 1 : 2)) % 3; onStageChange(next); document.getElementById(`journey-tab-${next}`)?.focus(); } }}><span className="journey-number">{index + 1}</span><span className="journey-chapter-icon"><Icon /></span><span className="journey-chapter-text"><strong>{title}</strong><small>{text}</small></span><span className="journey-chapter-arrow"><ArrowRight size={20} /></span></button>)}</div>
      </div>
      <div className="journey-visual"><div className="journey-backdrop" aria-hidden="true"><div className="journey-campus"><Image src="/images/journey-graduates.jpg" alt="" fill sizes="400px" /></div><span className="journey-handwritten">Your next chapter.</span></div>
        <div className="journey-panel" key={active} role="tabpanel" id="journey-panel" aria-labelledby={`journey-tab-${active}`}>
          <div className="journey-panel-heading"><div><h3>{['Find your fit, at your own pace.', 'Your fees. A little more clarity.', 'A new chapter, a clearer plan.'][active]}</h3></div><p>{['Search schools, explore programmes, and save your favourites.', 'See what needs paying and keep every next step together.', 'Bring the essentials for your big move into one simple checklist.'][active]}</p></div>
          {active === 0 ? <div className="journey-search-window">
            <div className="journey-search-body"><form onSubmit={event => { event.preventDefault(); setSearch(query.trim()); }}><label className="journey-search-input"><Search size={18} /><input aria-label={live ? "Search schools on Alutta" : "Search sample schools"} placeholder="Search schools, programmes or cities" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="journey-search-submit" type="submit">Search</button></form>
              <div className="journey-search-tools"><button className="journey-filter-toggle" aria-expanded={showFilters} aria-controls="journey-filters" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={14} />Filters{(country || field) && <span className="journey-filter-dot" />}</button><span aria-live="polite">{saved.length ? `${saved.length} saved to your shortlist` : live ? "Schools on Alutta today." : "Example schools, to show how it works."}</span></div>
              {showFilters && <div className="journey-filters" id="journey-filters"><label><span className="sr-only">Country</span><select aria-label="Country" value={country} onChange={event => setCountry(event.target.value)}><option value="">Country</option>{countries.map(c => <option key={c}>{c}</option>)}</select></label><label><span className="sr-only">{tagLabel}</span><select aria-label={tagLabel} value={field} onChange={event => setField(event.target.value)}><option value="">{tagLabel}</option>{tags.map(t => <option key={t}>{t}</option>)}</select></label><button onClick={() => { setCountry(''); setField(''); setQuery(''); setSearch(''); }}>Clear all</button></div>}
              
              {active === 0 && <div className="journey-slider-controls" aria-label="School carousel controls"><button aria-label="Previous schools" aria-controls="selected-school-carousel" disabled={scrollBounds.start} onClick={() => slideSchools(-1)}><ArrowLeft size={18} /></button><button aria-label="Next schools" aria-controls="selected-school-carousel" disabled={scrollBounds.end || filtered.length === 0} onClick={() => slideSchools(1)}><ArrowRight size={18} /></button></div>}
              <div className="journey-school-grid journey-school-carousel" id="selected-school-carousel" role="region" aria-label="Selected schools" aria-roledescription="carousel" ref={schoolTrack} onScroll={updateScrollBounds} tabIndex={0}>{filtered.map((school) => <article className="journey-school" key={`${school.country}-${school.name}`}><div className={`journey-school-photo ${school.live ? "live" : school.country === "United Kingdom" ? "school-courtyard" : ""}`}><Image src={school.image} alt={school.imageAlt} fill sizes="(max-width: 600px) 80vw, 240px" /><button aria-label={`Save ${school.name}`} aria-pressed={saved.includes(school.name)} onClick={() => toggle(school.name)}><Heart size={17} fill={saved.includes(school.name) ? 'currentColor' : 'none'} /></button></div><div className="journey-school-copy"><h4>{school.name}</h4><p><MapPin size={12} />{school.city}</p><button className="journey-programme-link" aria-expanded={expanded === school.name} onClick={() => setExpanded(expanded === school.name ? null : school.name)}>View programmes <ArrowRight size={14} /></button>{expanded === school.name && <div className="journey-programmes"><small>{school.live ? "Programmes" : "Programme examples"}</small>{school.programmes.map(p => <span key={p}>{p}</span>)}</div>}</div></article>)}</div>

              {filtered.length === 0 && <div className="journey-empty"><Search /><strong>{live ? "No schools match yet." : "No sample schools match yet."}</strong><p>Try a different search or clear your filters.</p></div>}
              <div className="journey-quiz"><Users /><div><strong>Not sure where to start?</strong><p>Find a starting point based on your goals.</p></div><button onClick={onQuiz}>Join the waitlist <ArrowRight size={16} /></button></div>
            </div></div> : <div className="journey-alternate"><span className="journey-example-label">INTERACTIVE PLANNING PREVIEW</span><div className="journey-alternate-banner">{active === 1 ? <ShieldCheck /> : <Plane />}<div><strong>{active === 1 ? 'Know what comes next.' : 'Make room for the adventure.'}</strong><p>{active === 1 ? 'Keep your fee details and payment instructions together.' : 'Small steps make a big move feel manageable.'}</p></div></div>{(active === 1 ? ['Review application fees', 'Check your offer deposit', 'Plan your tuition payment'] : ['Prepare your visa documents', 'Find your accommodation', 'Plan your flight and arrival']).map((task, index) => { const key = `${active}-${index}`; return <button className="journey-planning-task" key={task} aria-pressed={done.includes(key)} onClick={() => setDone(values => values.includes(key) ? values.filter(v => v !== key) : [...values, key])}><span>{done.includes(key) ? <Check size={17} /> : index + 1}</span><strong>{task}</strong><small>{done.includes(key) ? 'Explored' : 'Explore step'}</small></button>; })}<div className="journey-quiz"><Users /><div><strong>Your journey starts with you.</strong><p>Get early access to your next chapter.</p></div><button onClick={onQuiz}>Join the waitlist <ArrowRight size={16} /></button></div></div>}

        </div>
      </div>
    </div>
  </section>;
}
