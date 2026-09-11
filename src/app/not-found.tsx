import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import HomeHeader from "@/components/home/HomeHeader";
import CareersFooter from "@/components/home/CareersFooter";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

/** The 404, in the site's own chrome. Before this existed a missing page fell
 *  through to Next's bare default with the old header and footer around it. */
export default function NotFound() {
  return <div className="atlas-home careers-home">
    <HomeHeader />
    <section className="careers-closing atlas-container" aria-labelledby="not-found-heading">
      <Compass size={38} aria-hidden="true" />
      <h1 id="not-found-heading">That page has<br /><em>moved on.</em></h1>
      <p>We could not find what you were looking for. The journey continues from the homepage.</p>
      <Link href="/" className="atlas-button lime">Back to Alutta <ArrowUpRight size={21} /></Link>
      <span className="careers-closing-orbit" aria-hidden="true" />
    </section>
    <CareersFooter topId="not-found-heading" />
  </div>;
}
