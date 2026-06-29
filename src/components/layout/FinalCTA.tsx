"use client";

import WaitlistForm from "@/components/ui/WaitlistForm";

function AnimatedPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#13CA58" stopOpacity="0" />
            <stop offset="50%" stopColor="#13CA58" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#13CA58" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lg2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#003024" stopOpacity="0" />
            <stop offset="50%" stopColor="#003024" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#003024" stopOpacity="0" />
          </linearGradient>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="#003024" fillOpacity="0.08" />
          </pattern>
          <pattern id="grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#003024" strokeWidth="0.5" strokeOpacity="0.06" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#dots)" />
        <path d="M -200 80 Q 200 120, 400 80 T 800 100 T 1200 80 T 1600 100 T 2000 80" fill="none" stroke="url(#lg1)" strokeWidth="1.5" style={{ animation: "flowR 12s ease-in-out infinite" }} />
        <path d="M 2200 280 Q 1700 340, 1300 280 T 700 300 T 100 280" fill="none" stroke="url(#lg2)" strokeWidth="1" style={{ animation: "flowL 18s ease-in-out infinite" }} />
        <style>{`
          @keyframes flowR { 0%{transform:translateX(-200px);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateX(200px);opacity:0} }
          @keyframes flowL { 0%{transform:translateX(200px);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateX(-200px);opacity:0} }
        `}</style>
      </svg>
    </div>
  );
}

export default function FinalCTA() {
  return (
    <section className="relative bg-white py-20 lg:py-28 overflow-hidden">
      <AnimatedPattern />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[44px] text-brand-dark leading-tight mb-6">
              Ready to start your<br />study abroad journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Join the early access waitlist and be among the first to try Alutta.
            </p>
          </div>

          {/* Right, form */}
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 shadow-sm">
            <WaitlistForm variant="cta" source="final_cta" />
          </div>
        </div>
      </div>
    </section>
  );
}
