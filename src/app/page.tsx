import Hero from "@/components/layout/Hero";
import Benefits from "@/components/layout/Benefits";
import Features from "@/components/layout/Features";
import JourneySection from "@/components/layout/JourneySection";
import Testimonials from "@/components/layout/Testimonials";
import HowItWorks from "@/components/layout/HowItWorks";
import FinalCTA from "@/components/layout/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <Features />
      <JourneySection />
      <Testimonials />
      <HowItWorks />
      <FinalCTA />
    </>
  );
}
