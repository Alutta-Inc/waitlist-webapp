"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Loader2, ChevronDown, Search, X } from "lucide-react";
import { UserLocation } from "@/types/journey";
import { sourceCountries } from "@/lib/journey-data";

interface LocationDetectorProps {
  onSubmit: (location: UserLocation) => void;
  onBack: () => void;
}

export default function LocationDetector({
  onSubmit,
  onBack,
}: LocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search
  const filteredCountries = sourceCountries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showDropdown]);

  // Attempt to detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      setIsDetecting(true);

      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.country_name && data.country_code) {
            setDetectedLocation(data.country_name);
            setDetectedCode(data.country_code);
            setSelectedCountry(data.country_name);
            setSelectedCode(data.country_code);
          }
        }
      } catch {
        console.log("Location detection unavailable");
      }

      setIsDetecting(false);
    };

    detectLocation();
  }, []);

  const handleContinue = () => {
    const locationName = useManual ? selectedCountry : detectedLocation || selectedCountry;
    
    if (!locationName) return;

    onSubmit({
      country: locationName,
      detectedAutomatically: !useManual && !!detectedLocation,
    });
  };

  const handleManualSelect = (countryName: string, countryCode: string) => {
    setSelectedCountry(countryName);
    setSelectedCode(countryCode);
    setUseManual(true);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleCloseDropdown = () => {
    setShowDropdown(false);
    setSearchQuery("");
  };

  const isValid = detectedLocation || selectedCountry;

  const getCountryCode = (countryName: string): string => {
    const country = sourceCountries.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase()
    );
    return country?.code || "??";
  };

  const displayCode = useManual ? selectedCode : detectedCode || selectedCode;

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

        <h3 className="font-display font-medium text-2xl text-brand-dark mb-2">
          Where are you now?
        </h3>
        <p className="text-brand-dark/60">
          This helps us personalize your journey with relevant visa info and timelines
        </p>
      </div>

      {/* Location Display */}
      <div className="space-y-4">
        {isDetecting ? (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            <span className="text-brand-dark/60">Detecting your location...</span>
          </div>
        ) : detectedLocation && !useManual ? (
          <div className="space-y-3">
            {/* Detected Location Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border-2 border-green-200">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                <span className="text-sm font-bold text-brand-dark">{detectedCode}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-700 font-medium">Detected location</p>
                <p className="text-brand-dark font-semibold text-lg">{detectedLocation}</p>
              </div>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>

            {/* Change option */}
            <button
              onClick={() => setUseManual(true)}
              className="text-sm text-brand-primary hover:underline"
            >
              Not right? Select a different country
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Manual Selection */}
            {!showDropdown ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowDropdown(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
                >
                  {selectedCountry ? (
                    <>
                      <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-brand-dark shrink-0">
                        {displayCode || getCountryCode(selectedCountry)}
                      </span>
                      <span className="flex-1 text-left text-brand-dark font-medium">
                        {selectedCountry}
                      </span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-6 h-6 text-brand-dark/40" />
                      <span className="flex-1 text-left text-brand-dark/40">
                        Select your country
                      </span>
                    </>
                  )}
                  <ChevronDown className="w-5 h-5 text-brand-dark/40" />
                </button>

                {/* Back to detected option */}
                {detectedLocation && useManual && (
                  <button
                    onClick={() => {
                      setUseManual(false);
                      setSelectedCountry(detectedLocation);
                      setSelectedCode(detectedCode || "");
                    }}
                    className="text-sm text-brand-primary hover:underline"
                  >
                    Use detected location ({detectedLocation})
                  </button>
                )}
              </>
            ) : (
              /* Inline dropdown - contained within card */
              <div className="border-2 border-brand-primary rounded-xl overflow-hidden bg-white">
                {/* Search header */}
                <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseDropdown}
                    className="p-2 text-brand-dark/40 hover:text-brand-dark transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable country list */}
                <div className="max-h-48 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleManualSelect(country.name, country.code)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-brand-dark shrink-0">
                          {country.code}
                        </span>
                        <span className="text-brand-dark text-left text-sm">{country.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-brand-dark/50 text-sm">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Continue Button - hidden when dropdown is open */}
      {!showDropdown && (
        <button
          onClick={handleContinue}
          disabled={!isValid || isDetecting}
          className={`
            w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
            ${
              isValid && !isDetecting
                ? "bg-brand-dark text-white hover:bg-brand-dark/90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          See My Journey
        </button>
      )}
    </div>
  );
}