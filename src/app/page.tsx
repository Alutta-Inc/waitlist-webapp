import Hero from "@/components/layout/Hero";
import Benefits from "@/components/layout/Benefits";
import Features from "@/components/layout/Features";
import JourneySection from "@/components/layout/JourneySection";
import HowItWorks from "@/components/layout/HowItWorks";
import FinalCTA from "@/components/layout/FinalCTA";

// The company's front door: what Alutta is, what it does, how it works, and
// one way in (/waitlist). The waitlist form itself is not on this page, and
// the testimonials section is out until there are real students to quote.
export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <Features />
      <JourneySection />
      <HowItWorks />
      <FinalCTA />
    </>
  );
}
