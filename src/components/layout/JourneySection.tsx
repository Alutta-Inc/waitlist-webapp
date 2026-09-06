import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// The "see how it works" film badge that sat on the photo opened a placeholder
// video id. It returns with the real film; until then the section makes no
// promise it cannot keep.
export default function JourneySection() {
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
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
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
                  Studying abroad should not feel like solving a puzzle with missing pieces. 
                  Between application fees, visa deadlines, tuition deposits, and accommodation 
                  bookings, it is easy to lose track, or worse, miss something important.
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

              <Link
                href="/waitlist"
                data-track="cta-journey"
                className="inline-flex items-center text-brand-dark font-semibold text-lg hover:text-brand-primary transition-colors"
              >
                Start your journey
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
