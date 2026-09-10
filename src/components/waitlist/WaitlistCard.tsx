"use client";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import WaitlistForm from "@/components/ui/WaitlistForm";
import { STUDENT_SIGNIN_URL } from "@/lib/site";
export default function WaitlistCard({ nigeria = false }: { nigeria?: boolean }){
 const [joined,setJoined]=useState(false);
 return <div className="waitlist-signup-card signup-body">
  <div className="waitlist-card-heading"><span className="waitlist-kicker">EARLY ACCESS <span className="waitlist-card-dots" aria-hidden="true"><i/><i/><i/></span></span><h2>{joined ? "Your next chapter is closer." : "Save your place."}</h2><p>{joined ? "Thanks for taking the first step with Alutta." : "Tell us a little about yourself and where you want to study. We’ll be in touch when it’s your turn."}</p></div>
  <WaitlistForm variant="hero" source={nigeria ? "nigeria-waitlist" : "waitlist"} destinationNames={nigeria ? ["Nigeria", "United States", "United Kingdom", "Canada", "China", "Australia"] : ["United States", "United Kingdom", "Canada", "China", "Australia"]} onSuccess={()=>setJoined(true)} />
  <div className="waitlist-form-note"><ShieldCheck size={16}/><p>Read our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Service</Link>.</p></div>
  <div className="waitlist-signin">Already a student on Alutta? <a href={STUDENT_SIGNIN_URL} data-track="cta-signin">Sign in <span aria-hidden="true">↗</span></a></div>
 </div>;
}
