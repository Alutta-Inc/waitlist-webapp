"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, GraduationCap, Stamp, CreditCard, Plane, Home, Car, MapPin } from "lucide-react";
import { Country, ProgramDetails, UserLocation } from "@/types/journey";
import { generateJourneyTimeline, getIntakeById } from "@/lib/journey-data";
import CountryFlag from "@/components/ui/CountryFlag";

interface JourneyTimelineProps {
  country: Country;
  programDetails: ProgramDetails;
  location: UserLocation;
  onContinue: () => void;
  onBack: () => void;
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  FileText,
  GraduationCap,
  Stamp,
  CreditCard,
  Plane,
  Home,
  Car,
  MapPin,
};

export default function JourneyTimeline({
  country,
  programDetails,
  location,
  onContinue,
  onBack,
}: JourneyTimelineProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);

  const intakeInfo = getIntakeById(programDetails.intake);
  const steps = generateJourneyTimeline(country, programDetails.intake, programDetails.university);
  const isRevealing = visibleSteps < steps.length;

  // Animate steps appearing one by one
  useEffect(() => {
    if (!isRevealing) {
      return;
    }

    const timer = setTimeout(() => {
      setVisibleSteps((prev) => prev + 1);
    }, 150);

    return () => clearTimeout(timer);
  }, [isRevealing, visibleSteps]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-brand-dark/60 hover:text-brand-dark mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex items-start gap-3 mb-2">
          <CountryFlag country={country} className="w-8 h-8 rounded-full shadow-sm shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-medium text-xl text-brand-dark leading-tight">
              Your Journey to {programDetails.university}
            </h3>
            <p className="text-brand-dark/60 text-sm mt-1">
              {programDetails.program} • {intakeInfo?.label}
            </p>
          </div>
        </div>

        {/* Origin badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-brand-dark/70 mt-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>From {location.country}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

        {/* Steps */}
        <div className="space-y-1">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon] || FileText;
            const isVisible = index < visibleSteps;

            return (
              <div
                key={step.id}
                className={`
                  relative flex items-start gap-4 p-3 rounded-xl transition-all duration-300
                  ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                  ${step.status === "ready" ? "bg-brand-primary/5" : ""}
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <div
                  className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${
                      step.status === "ready"
                        ? "bg-brand-primary text-white"
                        : "bg-white border-2 border-gray-200 text-brand-dark/40"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`font-medium text-sm ${
                        step.status === "ready" ? "text-brand-dark" : "text-brand-dark/70"
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.status === "ready" && (
                      <span className="shrink-0 text-xs font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-dark/50 mt-0.5">
                    {(step as { dateRange?: string }).dateRange}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Statement */}
      <div className="text-center py-3 border-t border-gray-100">
        <p className="text-sm text-brand-dark/50">
          Free to use. We only earn when we help you pay, book, or settle.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        disabled={isRevealing}
        className={`
          w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
          ${
            !isRevealing
              ? "bg-brand-dark text-white hover:bg-brand-dark/90"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        Join the Waitlist
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
