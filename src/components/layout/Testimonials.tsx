"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Chioma Adeleke",
    role: "Graduate Student, USA",
    shortQuote: "Alutta made my dream of studying abroad feel achievable, not overwhelming",
    fullQuote:
      "Alutta made my dream of studying abroad feel achievable, not overwhelming. As a first-generation international student, I had no idea where to start. The fees, the deadlines, the visa process — it was all so confusing. But Alutta laid everything out for me step by step. I knew exactly what to pay and when. The support team was always there when I had questions. I honestly do not think I could have done this without them. Now I am thriving at my dream school in Boston!",
    image: "https://images.unsplash.com/photo-1500301111609-42f1aa6df72a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bgColor: "bg-[#FDE8E8]",
    textColor: "text-[#BE185D]",
    accentColor: "text-[#BE185D]",
  },
  {
    id: 2,
    name: "Emmanuel Okonkwo",
    role: "Undergraduate, Canada",
    shortQuote: "I knew exactly what to pay and when. No surprises, no stress",
    fullQuote:
      "I knew exactly what to pay and when. No surprises, no stress. Before Alutta, I was using spreadsheets to track my fees and deadlines. I missed a deposit once and almost lost my admission. When I found Alutta, everything changed. The journey timeline showed me every single payment I needed to make. The exchange rates were transparent, and I could pay directly from Nigeria. My parents were so relieved to see everything organized in one place. I am now in my second year at University of Toronto!",
    image: "https://images.unsplash.com/photo-1683135231682-51fb7eb05749?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bgColor: "bg-[#E8F5F2]",
    textColor: "text-[#047857]",
    accentColor: "text-[#047857]",
  },
  {
    id: 3,
    name: "Fatima Hassan",
    role: "Masters Student, UK",
    shortQuote: "From visa fees to tuition, everything was handled in one place",
    fullQuote:
      "From visa fees to tuition, everything was handled in one place. I was accepted to three universities in the UK, and Alutta helped me compare the total costs — not just tuition, but visa fees, accommodation deposits, and living expenses. That clarity helped me make the right choice for my family's budget. When it came time to pay, I did not have to worry about exchange rates or hidden fees. Alutta handled it all. The settlement support when I arrived in London was the cherry on top!",
    image: "https://images.unsplash.com/photo-1641464587469-fa15d2220930?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bgColor: "bg-[#EDE9FE]",
    textColor: "text-[#7C3AED]",
    accentColor: "text-[#7C3AED]",
  },
  {
    id: 4,
    name: "Daniel Adeyemi",
    role: "PhD Candidate, USA",
    shortQuote: "The settlement support made my first week abroad completely stress-free",
    fullQuote:
      "The settlement support made my first week abroad completely stress-free. I landed at JFK with two heavy bags and a lot of anxiety. But someone from Alutta's network was there to pick me up! They helped me get to my apartment, took me to get a SIM card, and even showed me where to buy Nigerian food nearby. I felt at home immediately. For anyone worried about the 'what happens when I land' part — Alutta has you covered. I can now focus 100% on my research.",
    image: "https://images.unsplash.com/photo-1647316897340-6b6de5597c0f?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bgColor: "bg-[#FEF3C7]",
    textColor: "text-[#B45309]",
    accentColor: "text-[#B45309]",
  },
];

function DotPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern
        id="dot-pattern"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.3" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="shrink-0 w-[85vw] sm:w-150 lg:w-175 rounded-2xl overflow-hidden border border-gray-100">
      <div className="grid grid-cols-2 h-full">
        {/* Image Side */}
        <div className="relative h-75 sm:h-87.5 lg:h-100">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            sizes="(max-width: 640px) 43vw, (max-width: 1024px) 300px, 350px"
            className="object-cover"
          />
          {/* Name Badge */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-sm">
            <span className={`font-medium ${testimonial.accentColor}`}>
              {testimonial.name.split(" ")[0]} {testimonial.name.split(" ")[1]}
            </span>
            <span className="text-brand-dark">, {testimonial.role.split(",")[0]}</span>
          </div>
        </div>

        {/* Quote Side */}
        <div
          className={`${testimonial.bgColor} relative p-6 sm:p-8 flex flex-col justify-between h-75 sm:h-87.5 lg:h-100 overflow-hidden`}
        >
          {/* Dot Pattern Overlay */}
          <DotPattern className="absolute inset-0 text-gray-500 pointer-events-none" />

          <div className="relative z-10 grow overflow-y-auto">
            {/* Quote Mark */}
            <span className={`text-5xl font-serif ${testimonial.accentColor} leading-none`}>
              &ldquo;
            </span>

            {/* Quote Text */}
            {isExpanded ? (
              <p className={`text-base leading-relaxed ${testimonial.textColor} mt-2`}>
                {testimonial.fullQuote}
              </p>
            ) : (
              <p
                className={`font-display font-medium text-xl sm:text-2xl lg:text-[26px] leading-snug ${testimonial.textColor} mt-2`}
              >
                {testimonial.shortQuote}
              </p>
            )}
          </div>

          {/* More/Less Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`relative z-10 inline-flex items-center font-medium ${testimonial.accentColor} hover:opacity-80 transition-opacity mt-4 self-end`}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Less
              </>
            ) : (
              <>
                More
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 500;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollability, 300);
    }
  };

  return (
    <section className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="pl-4 pr-4 md:pl-6 md:pr-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[42px] text-brand-dark">
              Why students love us
            </h2>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors ${
                  canScrollLeft
                    ? "hover:bg-gray-100 text-brand-dark"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors ${
                  canScrollRight
                    ? "hover:bg-gray-100 text-brand-dark"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 md:px-6 lg:px-8 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="pl-4 md:pl-6" /> {/* Spacer for alignment */}

        {testimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}

        <div className="pr-4 md:pr-6 shrink-0" /> {/* Spacer for alignment */}
      </div>
    </section>
  );
}
