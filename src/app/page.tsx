import type { Metadata } from "next";
import HomeExperience from "@/components/home/HomeExperience";

export const metadata: Metadata = { alternates: { canonical: "/", languages: { en: "/", "en-NG": "/ng", "x-default": "/" } } };

// The homepage's school explorer is a curated demo, not a catalogue read.
// institution-service's public showcase (lib/showcase.ts) stays available
// for the day the site lists real partners; nothing on this page reads it.
export default function Home() {
  return <HomeExperience />;
}
