"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Route, 
  CreditCard, 
  FileCheck, 
  Plane, 
  Home, 
  MapPin, 
  Wallet, 
  HeadphonesIcon,
  Check,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Search,
    title: "School Research",
    description:
      "Explore universities across the US, UK, and Canada. Compare programs, tuition costs, and admission requirements all in one place.",
    image: "https://images.unsplash.com/photo-1552512556-37ac2c074743?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "University campus",
    studentName: "Fatima Al-Hassan",
    studentRole: "Prospective Student",
    uiType: "search",
  },
  {
    icon: Route,
    title: "Journey Mapping",
    description:
      "We map your entire study abroad journey, from application to graduation. See every fee, deadline, and milestone.",
    image: "https://images.unsplash.com/photo-1539207004020-449ced88dbf4?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Students planning their journey",
    studentName: "Sarah Chen",
    studentRole: "Graduate Student",
    uiType: "steps",
    uiSteps: ["Apply", "Accept", "Visa", "Travel", "Settle"],
    uiCurrentStep: 2,
  },
  {
    icon: CreditCard,
    title: "Fee Payments",
    description:
      "Pay application fees, tuition deposits, and semester fees all from one platform. Competitive rates with no hidden charges.",
    image: "https://images.unsplash.com/photo-1644635681984-0f526ca05af0?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Secure payment processing",
    studentName: "James Okonkwo",
    studentRole: "Undergraduate Student",
    uiType: "payment",
    uiAmount: "$12,500.00",
    uiExchangeRate: "₦1 = $0.00065",
  },
  {
    icon: FileCheck,
    title: "Visa Support",
    description:
      "Get guided support through your visa application. We help you understand requirements and track your application status.",
    image: "https://images.unsplash.com/photo-1659356874266-c672f53e6473?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Visa application documents",
    studentName: "Priya Sharma",
    studentRole: "Masters Student",
    uiType: "steps",
    uiSteps: ["Documents", "Review", "Submit", "Interview", "Done"],
    uiCurrentStep: 3,
  },
  {
    icon: Plane,
    title: "Flight Booking",
    description:
      "Once your visa is approved, book your flights directly through Alutta. Student-friendly rates and flexible options.",
    image: "https://images.unsplash.com/photo-1627923146572-5e3d07f32980?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Airplane flying",
    studentName: "Ahmed Hassan",
    studentRole: "PhD Candidate",
    uiType: "flight",
    uiRoute: "Lagos → New York",
    uiDate: "Aug 15, 2025",
    uiPrice: "$850",
  },
  {
    icon: Home,
    title: "Accommodation",
    description:
      "Browse verified student housing options near your university. Pay deposits securely before you even land.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Student accommodation",
    studentName: "Maria Santos",
    studentRole: "Exchange Student",
    uiType: "accommodation",
    uiDetails: "2BR Shared • $800/mo",
  },
  {
    icon: MapPin,
    title: "Airport Pickup",
    description:
      "A local rep meets you at the airport, helps you navigate arrival, and gets you safely to your accommodation.",
    image: "https://images.unsplash.com/photo-1731755429012-83a172bec732?q=80&w=1371&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Airport arrival hall",
    studentName: "David Kim",
    studentRole: "Undergraduate Student",
    uiType: "pickup",
    uiLocation: "JFK Airport",
    uiDate: "Aug 16, 2025 • 2:30 PM",
  },
  {
    icon: Wallet,
    title: "Settlement Services",
    description:
      "Get help setting up your bank account, local SIM card, and other essentials. We make your first week stress-free.",
    image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Banking services",
    studentName: "Emma Wilson",
    studentRole: "Graduate Student",
    uiType: "checklist",
    uiChecklist: ["Bank Account", "SIM Card", "Transport Card", "Student ID"],
    uiCompleted: 2,
  },
  {
    icon: HeadphonesIcon,
    title: "Ongoing Support",
    description:
      "Our support does not end when you land. Get help throughout your studies, from renewing visas to finding work.",
    image: "https://images.unsplash.com/photo-1656733519386-105d8c149ef8?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Student on phone call",
    studentName: "Chen Wei",
    studentRole: "Masters Student",
    uiType: "support",
    uiResponse: "Avg. response: 5 mins",
  },
];

function FeatureCard({ 
  feature, 
  isActive, 
  onHover 
}: { 
  feature: typeof features[0]; 
  isActive: boolean;
  onHover: () => void;
}) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col h-full",
        isActive 
          ? "bg-white shadow-lg" 
          : "hover:bg-white/60"
      )}
      onMouseEnter={onHover}
    >
      {/* Icon */}
      <feature.icon 
        className="w-7 h-7 text-brand-dark mb-5" 
        strokeWidth={1.5} 
      />

      {/* Title */}
      <h3 className="font-display font-medium text-[26px] text-brand-dark mb-4">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-lg text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

function ImageCard({ feature }: { feature: typeof features[0] }) {
  return (
    <div className="bg-[#E8E5E0] rounded-2xl overflow-hidden shadow-lg">
      {/* Student Image - 60% of card */}
      <div className="relative h-80">
        <Image
          src={feature.image}
          alt={feature.imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover object-center"
          priority
        />
        {/* Name Badge */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <span className="text-brand-accent font-medium">{feature.studentName}</span>
          <span className="text-brand-dark">, {feature.studentRole}</span>
        </div>
      </div>

      {/* UI Mockup Section - 40% of card, edge to edge */}
      <div className="bg-white p-5 h-70 flex flex-col">
        {/* Search UI */}
        {feature.uiType === "search" && (
          <>
            <p className="text-gray-500 text-sm mb-1">Find Your School</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-4">
              University Search
            </h4>
            <div className="space-y-3 grow">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Search universities...</span>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-sm rounded-full">US</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">UK</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Canada</span>
              </div>
              <p className="text-gray-500 text-sm">500+ universities available</p>
            </div>
          </>
        )}

        {/* Steps UI */}
        {feature.uiType === "steps" && feature.uiSteps && (
          <>
            <p className="text-gray-500 text-sm mb-1">Progress Tracker</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-4">
              Your Journey
            </h4>
            <div className="space-y-3 grow">
              <div className="flex justify-between text-xs">
                {feature.uiSteps.map((step, idx) => (
                  <span 
                    key={step}
                    className={cn(
                      "text-center",
                      idx < (feature.uiCurrentStep || 0) ? "text-brand-accent" : "text-gray-400"
                    )}
                  >
                    {step}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {feature.uiSteps.map((step, idx) => (
                  <div key={step} className="flex items-center flex-1">
                    <div 
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                        idx < (feature.uiCurrentStep || 0)
                          ? "bg-brand-accent text-white" 
                          : idx === feature.uiCurrentStep
                            ? "bg-brand-accent/20 text-brand-accent border-2 border-brand-accent"
                            : "bg-gray-200 text-gray-400"
                      )}
                    >
                      {idx < (feature.uiCurrentStep || 0) ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    {idx < feature.uiSteps.length - 1 && (
                      <div 
                        className={cn(
                          "flex-1 h-0.5 mx-1",
                          idx < (feature.uiCurrentStep || 0) ? "bg-brand-accent" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-2">Step {(feature.uiCurrentStep || 0) + 1} of {feature.uiSteps.length}</p>
            </div>
          </>
        )}

        {/* Payment UI */}
        {feature.uiType === "payment" && (
          <>
            <p className="text-gray-500 text-sm mb-1">Fall 2025 Tuition</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-4">
              Payment Summary
            </h4>
            <div className="space-y-2 grow">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-brand-dark">{feature.uiAmount}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Rate</span>
                <span className="text-brand-dark text-sm">{feature.uiExchangeRate}</span>
              </div>
            </div>
            <button className="w-full bg-brand-accent text-white py-2.5 rounded-lg font-semibold text-sm">
              Pay Now
            </button>
          </>
        )}

        {/* Flight UI */}
        {feature.uiType === "flight" && (
          <>
            <p className="text-gray-500 text-sm mb-1">{feature.uiRoute}</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-4">
              Flight Booking
            </h4>
            <div className="space-y-2 grow">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Departure</span>
                <span className="text-brand-dark">{feature.uiDate}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Price</span>
                <span className="font-semibold text-brand-dark text-lg">{feature.uiPrice}</span>
              </div>
            </div>
            <button className="w-full bg-brand-dark text-white py-2.5 rounded-lg font-semibold text-sm">
              Book Flight
            </button>
          </>
        )}

        {/* Accommodation UI */}
        {feature.uiType === "accommodation" && (
          <>
            <p className="text-gray-500 text-sm mb-1">University Apartments</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-4">
              Housing Confirmed
            </h4>
            <div className="space-y-3 grow">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Booking Confirmed</span>
              </div>
              <p className="text-gray-600">{feature.uiDetails}</p>
              <p className="text-gray-500 text-sm">Move-in: Aug 14, 2025</p>
            </div>
          </>
        )}

        {/* Pickup UI */}
        {feature.uiType === "pickup" && (
          <>
            <p className="text-gray-500 text-sm mb-1">{feature.uiLocation}</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-4">
              Pickup Scheduled
            </h4>
            <div className="space-y-3 grow">
              <div className="flex items-center gap-3 p-3 bg-brand-accent/10 rounded-lg">
                <MapPin className="w-5 h-5 text-brand-accent" />
                <span className="text-brand-dark font-medium">Terminal 4, Arrivals</span>
              </div>
              <p className="text-gray-600">{feature.uiDate}</p>
              <p className="text-gray-500 text-sm">Driver: Michael Thompson</p>
            </div>
          </>
        )}

        {/* Checklist UI */}
        {feature.uiType === "checklist" && feature.uiChecklist && (
          <>
            <p className="text-gray-500 text-sm mb-1">First Week</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-3">
              Setup Progress
            </h4>
            <div className="space-y-1.5 grow">
              {feature.uiChecklist.map((item, idx) => (
                <div 
                  key={item}
                  className="flex items-center gap-3 py-1.5"
                >
                  <div 
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      idx < (feature.uiCompleted || 0)
                        ? "bg-brand-accent text-white" 
                        : "border-2 border-gray-300"
                    )}
                  >
                    {idx < (feature.uiCompleted || 0) && <Check className="w-3 h-3" />}
                  </div>
                  <span className={cn(
                    "text-sm",
                    idx < (feature.uiCompleted || 0) ? "text-brand-dark" : "text-gray-400"
                  )}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Support UI */}
        {feature.uiType === "support" && (
          <>
            <p className="text-gray-500 text-sm mb-1">24/7 Assistance</p>
            <h4 className="font-display font-medium text-xl text-brand-dark mb-4">
              Support Available
            </h4>
            <div className="space-y-3 grow">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-700 font-medium">Live Support Active</span>
              </div>
              <p className="text-gray-500 text-sm">{feature.uiResponse}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Chat</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Email</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">Call</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="features" className="bg-brand-bg py-20 lg:py-28">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="pl-4 pr-4 md:pl-6 md:pr-6">
          {/* Section Heading */}
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[42px] text-brand-dark mb-16 lg:mb-20">
            One platform to power your journey
          </h2>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-12 lg:gap-16">
            {/* Left Side - Feature Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  isActive={activeFeature === index}
                  onHover={() => setActiveFeature(index)}
                />
              ))}
            </div>

            {/* Right Side - Sticky Image Card */}
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <ImageCard feature={features[activeFeature]} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
