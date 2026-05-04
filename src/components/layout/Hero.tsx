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

        {/* Abstract Dotted Pattern - Top Right */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-40">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid of dots */}
            {Array.from({ length: 12 }).map((_, row) =>
              Array.from({ length: 12 }).map((_, col) => {
                const x = col * 32 + 16;
                const y = row * 32 + 16;
                // Create a fade effect from top-right
                const opacity = Math.max(0, 1 - (row * 0.08 + col * 0.02));
                const size = Math.max(1.5, 3 - row * 0.15);
                return (
                  <circle
                    key={`${row}-${col}`}
                    cx={x}
                    cy={y}
                    r={size}
                    fill="#1e3a5f"
                    opacity={opacity * 0.6}
                  />
                );
              })
            )}
          </svg>
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
                    fill="#0ea5e9"
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
              stroke="#1e3a5f"
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
              <div className="lg:max-w-xl">
                {/* Accent Text - Mier B Book */}
                <p className="text-brand-accent text-center lg:text-left text-2xl leading-tight font-[450] mb-4">
                  Your study abroad companion
                </p>

                {/* Headline - Recoleta Medium */}
                <h1 className="font-display font-medium text-center lg:text-left text-4xl sm:text-5xl lg:text-[52px] text-brand-dark leading-none mb-6">
                  The all-in-one
                  <br />
                  platform for
                  <br />
                  <span className="text-brand-primary">international students</span>
                </h1>

                {/* Subheadline - Mier B Regular */}
                <p className="text-center lg:text-left text-xl sm:text-2xl text-brand-dark leading-tight mb-8">
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