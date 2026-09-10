"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight, Landmark, Plane, Play, Wallet, X } from "lucide-react";

// Supply the approved video file URL here through the public environment setting.
const videoUrl = process.env.NEXT_PUBLIC_EXPLAINER_VIDEO_URL;

export default function ExplainerModal({ onJoin }: { onJoin: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const close = () => dialog.current?.close();
  return <>
    <button className="atlas-hero-secondary" onClick={() => { setFailed(false); dialog.current?.showModal(); }} aria-haspopup="dialog"><span><Play size={17} fill="currentColor" aria-hidden /></span>Take a look around</button>
    <dialog className="explainer-dialog" ref={dialog} aria-labelledby="explainer-title" onClose={() => video.current?.pause()} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="explainer-content">
        <div className="explainer-top"><span><Play size={12} fill="currentColor" /> A QUICK LOOK AROUND</span><button autoFocus className="explainer-close" aria-label="Close explainer" onClick={close}><X /></button></div>
        <div className="explainer-screen">
          {videoUrl && !failed ? <video ref={video} controls playsInline preload="metadata" poster="/images/hero-campus.png" aria-label="How Alutta works" onError={() => setFailed(true)}><source src={videoUrl} />{process.env.NEXT_PUBLIC_EXPLAINER_CAPTIONS_URL && <track kind="captions" src={process.env.NEXT_PUBLIC_EXPLAINER_CAPTIONS_URL} srcLang="en" label="English" />}</video> : <div className="explainer-poster"><Image src="/images/hero-campus.png" alt="Student looking ahead to life on campus" fill sizes="(max-width: 760px) 95vw, 720px" /><div className="explainer-poster-shade" /><span className="explainer-wordmark">Alutta</span><div className="explainer-poster-copy"><span>More than a degree.</span><strong>Your next chapter<br />starts here.</strong><p>{failed ? "The video couldn’t load. Please try again later." : "Our explainer video is coming soon."}</p></div></div>}
        </div>
        <h2 id="explainer-title">See how Alutta works</h2>
        <p className="explainer-intro">Alutta helps students discover schools, prepare applications, make payments, plan travel, and settle into a new city.</p>
        <div className="explainer-features">{[{ Icon: Landmark, title: "Explore schools", detail: "Find the right fit" }, { Icon: Wallet, title: "Pay securely", detail: "Through trusted partners" }, { Icon: Plane, title: "Travel and settle", detail: "Support at every step" }].map(({ Icon, title, detail }) => <div key={title}><span><Icon aria-hidden="true" /></span><div><strong>{title}</strong><small>{detail}</small></div></div>)}</div>
        <div className="explainer-actions"><button className="atlas-button" onClick={() => { close(); onJoin(); }}>Join the waitlist <ArrowUpRight size={20} /></button><button className="explainer-later" onClick={close}>Maybe later</button></div>
      </div>
    </dialog>
  </>;
}
