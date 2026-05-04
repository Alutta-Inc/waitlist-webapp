"use client";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index === currentStep
              ? "w-8 bg-brand-primary"
              : index < currentStep
              ? "w-4 bg-brand-primary/40"
              : "w-4 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}