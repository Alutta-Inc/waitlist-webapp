"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, ChevronDown, Search, X } from "lucide-react";
import { Country, ProgramDetails, IntakePeriod } from "@/types/journey";
import { getUniversitiesByCountry, intakeOptions } from "@/lib/journey-data";

interface ProgramDetailsFormProps {
  country: Country;
  onSubmit: (details: ProgramDetails) => void;
  onBack: () => void;
}

// Validation helper functions
function validateProgram(value: string): { isValid: boolean; error: string | null } {
  const trimmed = value.trim();
  
  // Check if empty
  if (!trimmed) {
    return { isValid: false, error: null }; // No error message for empty, just invalid
  }
  
  // Check minimum length (at least 2 characters)
  if (trimmed.length < 2) {
    return { isValid: false, error: "Program name must be at least 2 characters" };
  }
  
  // Check if it contains at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: "Program name must contain letters" };
  }
  
  // Check if it's not just special characters and spaces
  const alphanumericCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length;
  if (alphanumericCount < 2) {
    return { isValid: false, error: "Please enter a valid program name" };
  }
  
  return { isValid: true, error: null };
}

export default function ProgramDetailsForm({
  country,
  onSubmit,
  onBack,
}: ProgramDetailsFormProps) {
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [programTouched, setProgramTouched] = useState(false);
  const [intake, setIntake] = useState<IntakePeriod | "">("");
  const [isUniversityUndecided, setIsUniversityUndecided] = useState(false);
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");

  const universities = useMemo(() => getUniversitiesByCountry(country), [country]);

  const filteredUniversities = useMemo(() => {
    if (!universitySearch) return universities;
    return universities.filter((u) =>
      u.name.toLowerCase().includes(universitySearch.toLowerCase())
    );
  }, [universities, universitySearch]);

  // Validate program
  const programValidation = validateProgram(program);
  const showProgramError = programTouched && program.length > 0 && !programValidation.isValid && programValidation.error;

  const isValid = (university || isUniversityUndecided) && programValidation.isValid && intake;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProgramTouched(true);
    
    if (!isValid || !intake) return;

    onSubmit({
      university: isUniversityUndecided ? "Undecided" : university,
      program: program.trim(),
      intake: intake as IntakePeriod,
      isUniversityUndecided,
    });
  };

  const handleUniversitySelect = (name: string) => {
    setUniversity(name);
    setShowUniversityDropdown(false);
    setUniversitySearch("");
    setIsUniversityUndecided(false);
  };

  const handleUndecided = () => {
    setIsUniversityUndecided(true);
    setUniversity("");
    setShowUniversityDropdown(false);
    setUniversitySearch("");
  };

  const handleCloseDropdown = () => {
    setShowUniversityDropdown(false);
    setUniversitySearch("");
  };

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
          Tell us about your program
        </h3>
        <p className="text-brand-dark/60">
          We&apos;ll use this to map your journey
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* University Field */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            University
          </label>

          {isUniversityUndecided ? (
            <div
              onClick={() => setIsUniversityUndecided(false)}
              className="w-full px-4 py-3 rounded-xl border-2 border-brand-primary/30 bg-brand-primary/5 text-brand-dark cursor-pointer flex items-center justify-between"
            >
              <span>I&apos;m still exploring options</span>
              <span className="text-sm text-brand-primary">Change</span>
            </div>
          ) : !showUniversityDropdown ? (
            <div
              onClick={() => setShowUniversityDropdown(true)}
              className={`
                w-full px-4 py-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all
                border-gray-200 hover:border-gray-300
                ${university ? "text-brand-dark" : "text-brand-dark/40"}
              `}
            >
              <span>{university || "Select a university"}</span>
              <ChevronDown className="w-5 h-5" />
            </div>
          ) : (
            /* Inline dropdown - contained within card */
            <div className="border-2 border-brand-primary rounded-xl overflow-hidden bg-white">
              {/* Search header */}
              <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40" />
                  <input
                    type="text"
                    placeholder="Search universities..."
                    value={universitySearch}
                    onChange={(e) => setUniversitySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
                    autoFocus
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

              {/* Scrollable options */}
              <div className="max-h-48 overflow-y-auto">
                {/* Undecided option */}
                <button
                  type="button"
                  onClick={handleUndecided}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-brand-primary font-medium border-b border-gray-100"
                >
                  I&apos;m still exploring options
                </button>

                {/* University list */}
                {filteredUniversities.map((uni) => (
                  <button
                    key={uni.id}
                    type="button"
                    onClick={() => handleUniversitySelect(uni.name)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-b-0"
                  >
                    <span className="text-brand-dark text-sm">{uni.name}</span>
                    <span className="text-xs text-brand-dark/40">{uni.city}</span>
                  </button>
                ))}

                {/* Custom entry hint */}
                {universitySearch && filteredUniversities.length === 0 && (
                  <button
                    type="button"
                    onClick={() => handleUniversitySelect(universitySearch)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="text-brand-dark text-sm">Use &quot;{universitySearch}&quot;</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Program Field */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            Program / Course
          </label>
          <input
            type="text"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            onBlur={() => setProgramTouched(true)}
            placeholder="e.g., Computer Science, MBA, Medicine"
            className={`
              w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors
              ${showProgramError 
                ? "border-red-300 focus:border-red-400" 
                : "border-gray-200 focus:border-brand-primary"
              }
            `}
          />
          {showProgramError && (
            <p className="mt-1.5 text-sm text-red-500">{programValidation.error}</p>
          )}
        </div>

        {/* Intake Field */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            When do you plan to start?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {intakeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setIntake(option.id)}
                className={`
                  px-4 py-3 rounded-xl border-2 text-center transition-all
                  ${
                    intake === option.id
                      ? "border-brand-primary bg-brand-primary/5 text-brand-dark font-medium"
                      : "border-gray-200 hover:border-gray-300 text-brand-dark/70"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid}
          className={`
            w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
            ${
              isValid
                ? "bg-brand-dark text-white hover:bg-brand-dark/90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Continue
        </button>
      </form>
    </div>
  );
}