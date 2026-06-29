"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";

type ChecklistMockup = {
  type: "checklist" | "settlement";
  items: { label: string; done: boolean }[];
};

type PaymentMockup = {
  type: "payment";
  amount: string;
  status: string;
  institution: string;
};

type Mockup = ChecklistMockup | PaymentMockup;

interface Step {
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  studentName: string;
  studentRole: string;
  mockup: Mockup;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Map your journey",
    description:
      "Tell us where you want to study, and we will lay out everything you need, fees, deadlines, documents, and milestones, in one clear timeline.",
    image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Student planning journey",
    studentName: "Amara Obi",
    studentRole: "Graduate Student",
    mockup: {
      type: "checklist",
      items: [
        { label: "Choose your school", done: true },
        { label: "Submit application", done: true },
        { label: "Pay application fee", done: true },
        { label: "Receive offer letter", done: false },
        { label: "Apply for visa", done: false },
        { label: "Book flights", done: false },
      ],
    },
  },
  {
    number: "2",
    title: "Pay with confidence",
    description:
      "From tuition deposits to visa fees, pay everything through one secure platform. Transparent rates, no hidden charges, and real-time tracking.",
    image: "https://images.unsplash.com/photo-1758874573126-cf93a36261e8?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Student making payment",
    studentName: "Emeka Okonkwo",
    studentRole: "Undergraduate Student",
    mockup: {
      type: "payment",
      amount: "$12,500.00",
      status: "Payment Successful",
      institution: "University of Toronto",
    },
  },
  {
    number: "3",
    title: "Settle in smoothly",
    description:
      "From airport pickup to opening a bank account, we connect you with everything you need to feel at home from day one. Focus on your studies, not logistics.",
    image: "https://images.unsplash.com/photo-1680918029754-3d6765210647?q=80&w=756&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Students settling in",
    studentName: "Priya Venkatesh",
    studentRole: "Masters Student",
    mockup: {
      type: "settlement",
      items: [
        { label: "Airport pickup", done: true },
        { label: "Accommodation check-in", done: true },
        { label: "Bank account opened", done: true },
        { label: "SIM card activated", done: false },
      ],
    },
  },
];

function StepMockup({ mockup }: { mockup: Mockup }) {
  if (mockup.type === "checklist" || mockup.type === "settlement") {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 w-64">
        <div className="space-y-2">
          {mockup.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  item.done
                    ? "bg-brand-accent text-white"
                    : "border-2 border-gray-300"
                }`}
              >
                {item.done && <Check className="w-3 h-3" />}
              </div>
              <span
                className={`text-sm ${
                  item.done ? "text-brand-dark" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mockup.type === "payment") {
    return (
      <div className="bg-white rounded-xl shadow-lg p-5 w-72">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-green-700 font-medium text-sm">
            {mockup.status}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-1">{mockup.institution}</p>
        <p className="text-2xl font-semibold text-brand-dark">{mockup.amount}</p>
      </div>
    );
  }

  return null;
}

// Step Number component using text-shadow for outline effect (like Collective)
function StepNumber({ number, isActive }: { number: string; isActive: boolean }) {
  // Colors
  const bgColor = "#E8F5F2"; // Section background
  const accentColor = "#13CA58"; // Brand accent
  
  // Text shadow creates the outline effect
  const textShadow = `${accentColor} -1px -1px 0px, ${accentColor} 1px -1px 0px, ${accentColor} -1px 1px 0px, ${accentColor} 1px 1px 0px`;
  
  return (
    <span
      className="font-body font-bold text-[100px] md:text-[120px] leading-none text-center"
      style={{
        color: isActive ? accentColor : bgColor,
        textShadow: textShadow,
      }}
    >
      {number}
    </span>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight * 0.5;

      // Determine active step
      let newActiveStep = 0;
      stepRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const stepCenter = rect.top + rect.height / 2;
          
          if (stepCenter < viewportCenter + 100) {
            newActiveStep = index;
          }
        }
      });

      setActiveStep(newActiveStep);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="relative">
      <div className="relative flex flex-col-reverse xl:flex-row">
        {/* Left Side - Steps Content */}
        <div 
          className="z-10 flex flex-1 flex-col px-6 py-10 pb-32 md:px-10 lg:px-16 xl:py-20 xl:pb-64"
          style={{ backgroundColor: "#E8F5F2" }}
        >
          {/* Spacer for mobile (image is on top) */}
          <div className="h-75 w-full md:h-[50vh] xl:h-0" />
          
          {/* Section Heading */}
          <h2 className="font-display font-medium text-3xl sm:text-[40px] text-brand-dark leading-tight pb-14 xl:pb-48">
            Peace of mind starts here
          </h2>

          {/* Steps */}
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={step.number}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                className="flex justify-center gap-6 md:gap-8 h-full grow md:h-auto md:grow-0"
              >
                {/* Number Column */}
                <div className="flex w-22.5 flex-col items-center">
                  {/* Step Number */}
                  <StepNumber number={step.number} isActive={isActive} />
                  
                  {/* Connector Line - below number, not on last step */}
                  {!isLast && (
                    <div 
                      className="w-px h-60 md:h-100 bg-black opacity-10"
                    />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex max-w-[320px] flex-col">
                  {/* Title - Recoleta */}
                  <h3 className="font-display text-[28px] leading-snug text-brand-dark">
                    {step.title}
                  </h3>
                  
                  {/* Description - Mierb Regular */}
                  <p className="font-body mt-3 text-[20px] leading-snug text-gray-600">
                    {step.description}
                  </p>

                  {/* Mobile mockup */}
                  <div className="xl:hidden mt-6 mb-10">
                    <StepMockup mockup={step.mockup} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side - Sticky Images */}
        <div className="absolute top-0 h-[75%] w-full xl:relative xl:flex xl:h-auto xl:w-auto xl:flex-1">
          <div className="sticky top-0 z-20 flex h-75 flex-1 flex-col overflow-hidden md:h-[50vh] xl:top-0 xl:h-screen">
            <div className="flex-1 overflow-hidden">
              <div className="relative h-full w-full">
                {steps.map((step, index) => {
                  const isActive = activeStep === index;
                  const isPast = activeStep > index;
                  const isFuture = activeStep < index;

                  return (
                    <div
                      key={step.number}
                      className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out"
                      style={{
                        transform: isPast 
                          ? 'translateY(-100%)' 
                          : isFuture 
                            ? 'translateY(100%)' 
                            : 'translateY(0)',
                        zIndex: isActive ? 10 : 5,
                      }}
                    >
                      <Image
                        src={step.image}
                        alt={step.imageAlt}
                        fill
                        className="object-cover object-top"
                        priority={index === 0}
                        sizes="(max-width: 1280px) 100vw, 50vw"
                        unoptimized
                      />

                      {/* Member Badge - top right */}
                      <span 
                        className={`absolute right-4 top-4 md:right-8 md:top-8 text-white text-base transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Alutta Student
                      </span>

                      {/* Name Badge - bottom right */}
                      <div 
                        className={`absolute bottom-8 right-8 flex items-center rounded-full bg-white/90 px-4 py-2 shadow-md transition-all duration-500 ${
                          isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                        }`}
                      >
                        <span className="text-brand-accent font-semibold text-sm sm:text-base">
                          {step.studentName},&nbsp;
                        </span>
                        <span className="text-gray-800 font-normal text-sm sm:text-base">
                          {step.studentRole}
                        </span>
                      </div>

                      {/* UI Mockup Card - bottom left (desktop only) */}
                      <div 
                        className={`absolute bottom-8 left-8 hidden md:block transition-all duration-500 ${
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                        style={{ transitionDelay: isActive ? "150ms" : "0ms" }}
                      >
                        <StepMockup mockup={step.mockup} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
