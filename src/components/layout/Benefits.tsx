import { GraduationCap, CreditCard, MapPin, Compass } from "lucide-react";

const benefits = [
  {
    icon: GraduationCap,
    title: "Mapped journey",
    description:
      "From application to graduation — we map every fee, deadline, and milestone so nothing catches you off guard.",
  },
  {
    icon: CreditCard,
    title: "Pay with ease",
    description:
      "Tuition, visa fees, accommodation deposits — pay everything from one platform with rates you can trust.",
  },
  {
    icon: MapPin,
    title: "Settle in smoothly",
    description:
      "Airport pickup, local SIM, bank account setup — we connect you with everything you need from day one.",
  },
  {
    icon: Compass,
    title: "All-in-one platform",
    description:
      "No more juggling multiple apps and websites. Your entire study abroad journey, managed in one place.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="px-4 md:px-6 lg:px-8">
         <div className="pl-4 pr-4 md:pl-6 md:pr-6">
          {/* Section Heading */}
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[42px] text-brand-dark mb-16">
            A journey with benefits
          </h2>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title}>
                {/* Icon */}
                <div className="w-14 h-14 bg-[#F5F0E6] rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                  <benefit.icon className="w-6 h-6 text-brand-dark" strokeWidth={1.5} />
                </div>

                {/* Title - Mier B SemiBold */}
                <h3 className="font-semibold text-2xl text-brand-dark mb-4 sm:mb-6">
                  {benefit.title}
                </h3>

                {/* Description - Mier B Regular */}
                <p className="text-xl text-gray-600 leading-normal">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}