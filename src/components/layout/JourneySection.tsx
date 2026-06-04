"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, Play } from "lucide-react";
import VideoModal from "@/components/ui/VideoModal";

// Placeholder YouTube video ID - replace with actual explainer video
const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ"; // Replace this with video ID

export default function JourneySection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <section className="bg-[#E8F5F2]">
        <div className="grid lg:grid-cols-2">
          {/* Left Side - Image */}
          <div className="relative h-100 lg:h-auto lg:min-h-150">
            <Image
              src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Student planning their study abroad journey"
              fill
              className="object-cover"
              priority
            />
            
            {/* Video Play Badge - Slimmer height, wider */}
            <button
              onClick={() => setIsVideoOpen(true)}
              className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm pl-5 pr-2.5 py-2 rounded-full shadow-lg flex items-center gap-3 hover:bg-white transition-colors group"
            >
              <span className="text-brand-dark text-sm font-semibold">
                See how it works in 2 minutes
              </span>
              <div className="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center group-hover:bg-brand-accent/90 transition-colors">
                <Play className="w-3.5 h-3.5 text-white ml-0.5 fill-white" />
              </div>
            </button>
          </div>

          {/* Right Side - Content */}
          <div className="px-4 md:px-6 lg:px-8">
            <div className="pl-4 pr-4 md:pl-6 md:pr-6 lg:pl-12 py-16 lg:py-24 max-w-xl">
              {/* Headline */}
              <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[42px] text-brand-dark leading-tight mb-8">
                Your journey, mapped from day one
              </h2>

              {/* Description */}
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed mb-8">
                <p>
                  Studying abroad shouldn&apos;t feel like solving a puzzle with missing pieces. 
                  Between application fees, visa deadlines, tuition deposits, and accommodation 
                  bookings, it is easy to lose track — or worse, miss something important.
                </p>
                <p>
                  Alutta gives you a clear, step-by-step view of your entire journey. From 
                  the moment you choose a school to the day you settle into your new home, 
                  you will always know what is next, what it costs, and when it is due.
                </p>
                <p>
                  No more scattered spreadsheets. No more surprise fees. Just{" "}
                  <span className="font-semibold text-brand-dark">clarity, confidence, and control</span> 
                  {" "}over one of the biggest decisions of your life.
                </p>
              </div>

              <a
                href="#journey-builder"
                className="inline-flex items-center text-brand-dark font-semibold text-lg hover:text-brand-primary transition-colors"
              >
                Start your journey
                <ChevronRight className="w-5 h-5 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoId={YOUTUBE_VIDEO_ID}
      />
    </>
  );
}
