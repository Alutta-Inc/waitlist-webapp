"use client";

import { Country } from "@/types/journey";
import { countries } from "@/lib/journey-data";
import CountryFlag from "@/components/ui/CountryFlag";

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onSelect: (country: Country) => void;
}

export default function CountrySelector({
  selectedCountry,
  onSelect,
}: CountrySelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-display font-medium text-2xl text-brand-dark mb-2">
          Where do you want to study?
        </h3>
        <p className="text-brand-dark/60">
          Select your destination country
        </p>
      </div>

      {/* Country Cards */}
      <div className="space-y-3">
        {countries.map((country) => (
          <button
            key={country.code}
            onClick={() => onSelect(country.code)}
            className={`
              w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
              ${
                selectedCountry === country.code
                  ? "border-brand-primary bg-brand-primary/5"
                  : "border-gray-100 hover:border-brand-primary/30 hover:bg-gray-50"
              }
            `}
          >
            {/* Flag */}
            <div className="shrink-0">
              <CountryFlag country={country.code} className="w-10 h-10 rounded-full shadow-sm" />
            </div>

            {/* Country Info */}
            <div className="flex-1 text-left">
              <p className="font-semibold text-brand-dark">{country.name}</p>
              <p className="text-sm text-brand-dark/50">
                {country.popular_universities.length}+ universities
              </p>
            </div>

            {/* Selection Indicator */}
            <div
              className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${
                  selectedCountry === country.code
                    ? "border-brand-primary bg-brand-primary"
                    : "border-gray-200"
                }
              `}
            >
              {selectedCountry === country.code && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}