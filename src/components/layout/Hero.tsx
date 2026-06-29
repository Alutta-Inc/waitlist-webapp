"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import HeroJourneyBuilder from "@/components/hero/HeroJourneyBuilder";
import VideoModal from "@/components/ui/VideoModal";

export default function Hero() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <>
      <section className="relative bg-brand-bg overflow-hidden">
        {/* Gradient Overlay - Warmer in bottom-right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 90% 100%, #E8E5E0 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 100% 80%, #F0EDE8 0%, transparent 50%)
            `,
          }}
        />

        {/* Elegant ambient pattern */}
        <div className="absolute -top-32 -right-40 w-[980px] h-[760px] pointer-events-none opacity-80 hidden sm:block">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 980 760"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-[heroPatternDrift_18s_ease-in-out_infinite]"
          >
            <defs>
              <linearGradient id="heroPatternStroke" x1="120" y1="80" x2="910" y2="620" gradientUnits="userSpaceOnUse">
                <stop stopColor="#029b47" stopOpacity="0.14" />
                <stop offset="0.48" stopColor="#13CA58" stopOpacity="0.1" />
                <stop offset="1" stopColor="#029b47" stopOpacity="0" />
              </linearGradient>
              <pattern id="heroPatternDots" x="0" y="0" width="34" height="34" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.15" fill="#029b47" fillOpacity="0.12" />
              </pattern>
              <mask id="heroPatternFade">
                <rect width="980" height="760" fill="black" />
                <ellipse cx="690" cy="210" rx="380" ry="290" fill="white" />
                <ellipse cx="330" cy="500" rx="300" ry="190" fill="white" opacity="0.55" />
              </mask>
            </defs>
            <g className="animate-[heroLineFloat_12s_ease-in-out_infinite]">
              <path d="M76 574C238 344 444 208 700 166C810 148 891 156 960 184" stroke="url(#heroPatternStroke)" strokeWidth="1.35" strokeLinecap="round" />
              <path d="M38 488C214 282 424 157 684 118C784 103 876 111 946 137" stroke="url(#heroPatternStroke)" strokeWidth="1" strokeLinecap="round" opacity="0.72" />
              <path d="M144 660C318 438 520 314 748 284C836 272 912 282 972 310" stroke="url(#heroPatternStroke)" strokeWidth="1" strokeLinecap="round" opacity="0.52" />
              <path d="M10 612C150 515 286 475 420 492C524 505 612 552 724 548" stroke="url(#heroPatternStroke)" strokeWidth="0.9" strokeLinecap="round" opacity="0.38" />
            </g>
            <g opacity="0.45" className="animate-[heroDotsFloat_16s_ease-in-out_infinite]">
              <rect x="238" y="42" width="650" height="560" fill="url(#heroPatternDots)" mask="url(#heroPatternFade)" />
            </g>
          </svg>
          <style jsx>{`
            @keyframes heroPatternDrift {
              0%, 100% {
                transform: translate3d(0, 0, 0) scale(1);
              }
              50% {
                transform: translate3d(-18px, 14px, 0) scale(1.025);
              }
            }
            @keyframes heroLineFloat {
              0%, 100% {
                transform: translate3d(0, 0, 0);
                opacity: 1;
              }
              50% {
                transform: translate3d(-28px, 20px, 0);
                opacity: 0.72;
              }
            }
            @keyframes heroDotsFloat {
              0%, 100% {
                transform: translate3d(0, 0, 0);
                opacity: 0.45;
              }
              50% {
                transform: translate3d(22px, -16px, 0);
                opacity: 0.7;
              }
            }
          `}</style>
        </div>

        {/* Abstract Dotted Pattern - Bottom Left (smaller, more subtle) */}
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-25 hidden lg:block">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Curved dot pattern */}
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => {
                const x = col * 36 + 18;
                const y = row * 36 + 18;
                // Create a fade effect from bottom-left
                const distFromBottomLeft = Math.sqrt(
                  Math.pow(col, 2) + Math.pow(7 - row, 2)
                );
                const opacity = Math.max(0, 1 - distFromBottomLeft * 0.12);
                return (
                  <circle
                    key={`bl-${row}-${col}`}
                    cx={x}
                    cy={y}
                    r={2}
                    fill="#13CA58"
                    opacity={opacity * 0.5}
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* Decorative curved line */}
        <div className="absolute top-20 right-20 w-32 h-32 pointer-events-none opacity-20 hidden xl:block">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 110 Q 60 10, 110 60"
              stroke="#003024"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="4 6"
            />
          </svg>
        </div>

        <div className="relative px-4 sm:px-8 lg:px-16 xl:px-24 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto lg:max-w-none">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="lg:max-w-2xl">
                {/* Accent Text - Mier B Book */}
                <p className="text-brand-accent text-center lg:text-left text-xl sm:text-2xl leading-tight font-semibold mb-4">
                  Your study abroad companion
                </p>

                {/* Headline */}
                <h1 className="font-display font-bold text-center lg:text-left text-[46px] sm:text-6xl lg:text-[72px] xl:text-[82px] text-brand-dark leading-[1.04] mb-7 text-balance">
                  <span className="block">The all-in-one platform</span>
                  <span className="block">
                    for <span className="text-brand-primary">international students</span>
                  </span>
                </h1>

                {/* Subheadline - Mier B Regular */}
                <p className="text-center lg:text-left text-xl sm:text-2xl text-brand-dark/80 leading-snug mb-8 max-w-xl">
                  From application fees to settling in — we map your entire journey,
                  handle your payments, and help you thrive in your new country.
                </p>

                {/* Video Button */}
                <div className="flex justify-center lg:justify-start mb-10">
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="group inline-flex items-center gap-3 text-brand-dark hover:text-brand-primary transition-colors"
                  >
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg shadow-brand-dark/10 group-hover:shadow-brand-primary/20 group-hover:scale-105 transition-all">
                      <Play className="w-5 h-5 fill-brand-primary text-brand-primary ml-0.5" />
                    </span>
                    <span className="font-medium">
                      See how it works in 2 minutes
                    </span>
                  </button>
                </div>

                {/* Mobile: Show CTA that scrolls to form */}
                <div className="lg:hidden flex justify-center">
                  <a
                    href="#journey-builder"
                    className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-dark/90 transition-colors"
                  >
                    Start Your Journey
                  </a>
                </div>
              </div>

              {/* Right Content - Journey Builder */}
              <div id="journey-builder" className="flex justify-center lg:justify-end">
                <HeroJourneyBuilder />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId="dQw4w9WgXcQ" // Replace with your actual video ID
      />
    </>
  );
}
