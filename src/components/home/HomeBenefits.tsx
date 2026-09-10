"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Check, Compass, FileText, Heart, Plane, Wallet } from "lucide-react";

import JourneyRoute from "./JourneyRoute";
const tasks = ["Research schools", "Prepare application", "Submit documents", "Track your progress"];
const details = [{ title: "University application", subtitle: "Your application deadline", Icon: FileText }, { title: "Tuition payment", subtitle: "Your payment deadline", Icon: Wallet }, { title: "Visa documents", subtitle: "Your document checklist", Icon: FileText }];
const statuses = ["Not started", "In progress", "Completed"];

export default function HomeBenefits() {
  const [checked, setChecked] = useState([0]);
  const [progress, setProgress] = useState([1, 0, 0]);
  const [saved, setSaved] = useState(false);
  return <section className="benefits" id="about" aria-labelledby="benefits-heading">
    <JourneyRoute />
    <div className="benefits-intro"><div><h2 id="benefits-heading">A big move.<br /><em>Not a big maze.</em></h2></div><div className="benefits-copy"><p>From school searches and paperwork to payments and travel plans, Alutta brings it all together in one place so you can move forward with clarity and confidence.</p><a href="#how-it-works">Meet your study abroad companion <ArrowRight size={21} /></a></div></div>
    <div className="benefits-cards">
      <article className="benefit-card plan-card"><div className="benefit-card-top"><span className="benefit-icon"><Compass /></span><span className="benefit-tag">PLAN</span></div><h3>Know your next step.</h3><p>A clear journey built around you. See what needs doing and when it needs to happen.</p><div className="benefit-art plan-art"><div className="benefit-portrait"><Image src="/images/hero-campus.png" alt="Student looking forward to her next chapter" fill sizes="240px" /></div><span className="benefit-scribble plan-scribble">Next step<br />looks good.</span><div className="benefit-checklist" aria-label="Example journey checklist">{tasks.map((task, index) => <button key={task} aria-pressed={checked.includes(index)} onClick={() => setChecked(values => values.includes(index) ? values.filter(v => v !== index) : [...values, index])} className={checked.includes(index) ? "done" : index === 1 ? "next" : ""}><span className="benefit-check">{checked.includes(index) && <Check size={13} />}</span><span>{task}</span>{index === 1 && <ArrowRight size={17} />}</button>)}</div></div></article>
      <article className="benefit-card details-card"><div className="benefit-card-top"><span className="benefit-icon"><Wallet /></span><span className="benefit-tag">STAY ORGANISED</span></div><h3>Keep the details together.</h3><p>Applications, deadlines, and fees in one place. Less tab switching. More moving forward.</p><div className="benefit-art details-art"><div className="benefit-details" aria-label="Example plan; select a task to change its status">{details.map(({ title, subtitle, Icon }, index) => <button key={title} onClick={() => setProgress(values => values.map((value, i) => i === index ? (value + 1) % 3 : value))} aria-label={`${title}: ${statuses[progress[index]]}. Change example status.`}><span className="benefit-detail-icon"><Icon size={19} /></span><span className="benefit-detail-title">{title}<small>{subtitle}</small></span><span className={`benefit-status status-${progress[index]}`} aria-live="polite">{statuses[progress[index]]}</span></button>)}</div><span className="benefit-scribble details-scribble">All in<br />one place.</span></div></article>
      <article className="benefit-card arrival-card"><div className="benefit-card-top"><span className="benefit-icon"><Heart /></span><span className="benefit-tag">FEEL READY</span></div><h3>Arrive with confidence.</h3><p>Prepare for life beyond the airport. A place to live, a way to connect, and a fresh start.</p><div className="benefit-art arrival-art"><div className="benefit-postcard campus-postcard"><div className="benefit-campus-photo"><Image src="/images/campus-friends.png" alt="Historic university courtyard and green lawn" fill sizes="260px" /></div><div className="benefit-postcard-caption"><span><Plane size={19} /></span>Your new chapter<br />is closer than you think.</div></div><span className="benefit-scribble arrival-note">New city.<br />New people.<br />A brighter you.</span><div className="benefit-postcard friends-postcard"><div className="benefit-friends-photo"><Image src="/images/campus-friends.png" alt="Three university friends smiling together on campus" fill sizes="220px" /></div><div className="friends-caption"><span className="benefit-scribble">Global friends.<br />Brighter futures.</span><button aria-label={saved ? "Unsave arrival inspiration" : "Save arrival inspiration"} aria-pressed={saved} onClick={() => setSaved(!saved)}><Heart size={19} fill={saved ? "currentColor" : "none"} /></button></div></div></div></article>
    </div>
  </section>;
}
