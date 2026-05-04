"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { JourneyData } from "@/types/journey";
import { getCountryByCode, getIntakeById } from "@/lib/journey-data";
import CountryFlag from "@/components/ui/CountryFlag";

interface SuccessStateProps {
  journeyData: JourneyData;
  onReset: () => void;
}

export default function SuccessState({ journeyData, onReset }: SuccessStateProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  const countryInfo = journeyData.country ? getCountryByCode(journeyData.country) : null;
  const intakeInfo = journeyData.programDetails?.intake 
    ? getIntakeById(journeyData.programDetails.intake) 
    : null;

  // Hide confetti animation after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center space-y-6 py-4">
      {/* Success Icon with Animation */}
      <div className="relative inline-flex items-center justify-center">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="absolute -top-2 -left-2 w-5 h-5 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -top-1 right-0 w-4 h-4 text-brand-accent animate-pulse delay-100" />
            <Sparkles className="absolute bottom-0 -left-1 w-4 h-4 text-pink-400 animate-pulse delay-200" />
          </div>
        )}
        
        {/* Checkmark circle */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="font-display font-medium text-2xl text-brand-dark">
          You&apos;re on the list!
        </h3>
        <p className="text-brand-dark/60">
          We&apos;ll be in touch soon with early access to Alutta
        </p>
      </div>

      {/* Journey Summary Card */}
      <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
        <p className="text-sm font-medium text-brand-dark/70">Your journey summary</p>
        
        <div className="space-y-2">
          {/* Destination */}
          {journeyData.country && (
            <div className="flex items-center gap-2">
              <CountryFlag country={journeyData.country} className="w-6 h-6 rounded-full" />
              <span className="text-brand-dark">{countryInfo?.name}</span>
            </div>
          )}
          
          {/* University & Program */}
          {journeyData.programDetails && (
            <div className="text-sm text-brand-dark/70">
              <p>{journeyData.programDetails.university}</p>
              <p>{journeyData.programDetails.program} • {intakeInfo?.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* What's Next */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-brand-dark">What happens next?</p>
        <div className="text-sm text-brand-dark/60 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-brand-primary font-semibold">1.</span>
            <span>Check your inbox for a confirmation email</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-brand-primary font-semibold">2.</span>
            <span>We&apos;ll notify you when Alutta launches</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-brand-primary font-semibold">3.</span>
            <span>Early access members get priority support</span>
          </div>
        </div>
      </div>

      {/* Reset Option */}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 transition-colors text-sm font-medium"
      >
        Map another journey
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}