import type { Metadata } from "next";
import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";
import WaitlistCard from "@/components/waitlist/WaitlistCard";
import "@/components/home/home.css";
import "@/app/waitlist/waitlist.css";
export const metadata:Metadata={title:"Join the Alutta Nigeria waitlist",alternates:{canonical:"/ng/waitlist"}};
export default function Page(){return <div className="atlas-home waitlist-home"><HomeHeader/><section className="waitlist-hero waitlist-container"><div className="waitlist-intro"><span className="waitlist-kicker">ALUTTA NIGERIA · EARLY ACCESS</span><h1 id="waitlist-heading">One profile.<br/>Your next degree.<br/><em>A world ahead.</em></h1><p>Tell us where you want to study, at home or abroad, and be among the first to receive email updates as access to postgraduate programmes at participating institutions becomes available through Alutta Nigeria.</p><div className="waitlist-promise">Free to join · One Alutta account</div></div><div id="join" className="waitlist-form-column"><WaitlistCard nigeria/></div></section><CareersFooter nigeria topId="waitlist-heading"/></div>}
