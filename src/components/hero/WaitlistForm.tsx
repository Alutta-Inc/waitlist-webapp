"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { JourneyData, WaitlistFormData } from "@/types/journey";

interface WaitlistFormProps {
  journeyData: JourneyData;
  onSubmit: () => void;
  onBack: () => void;
}

// Validation helper functions
function validateName(value: string): { isValid: boolean; error: string | null } {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return { isValid: false, error: null };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, error: "Must be at least 2 characters" };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { isValid: false, error: "Only letters, spaces, hyphens allowed" };
  }
  
  return { isValid: true, error: null };
}

function validateEmail(value: string): { isValid: boolean; error: string | null } {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return { isValid: false, error: null };
  }
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true, error: null };
}

export default function WaitlistForm({
  journeyData,
  onSubmit,
  onBack,
}: WaitlistFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Touch states for showing validation errors
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Validations
  const firstNameValidation = validateName(firstName);
  const lastNameValidation = validateName(lastName);
  const emailValidation = validateEmail(email);
  
  // Show errors only after field is touched and has content
  const showFirstNameError = firstNameTouched && firstName.length > 0 && !firstNameValidation.isValid && firstNameValidation.error;
  const showLastNameError = lastNameTouched && lastName.length > 0 && !lastNameValidation.isValid && lastNameValidation.error;
  const showEmailError = emailTouched && email.length > 0 && !emailValidation.isValid && emailValidation.error;

  const isValid = firstNameValidation.isValid && lastNameValidation.isValid && emailValidation.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show any errors
    setFirstNameTouched(true);
    setLastNameTouched(true);
    setEmailTouched(true);
    
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    // Prepare data for submission
    const formData: WaitlistFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      country: journeyData.country,
      university: journeyData.programDetails?.university || "",
      program: journeyData.programDetails?.program || "",
      intake: journeyData.programDetails?.intake || null,
      location: journeyData.location?.country || "",
    };

    try {
      // Store in localStorage for now (backend integration later)
      const existingData = localStorage.getItem("alutta_waitlist");
      const waitlist = existingData ? JSON.parse(existingData) : [];
      waitlist.push({
        ...formData,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("alutta_waitlist", JSON.stringify(waitlist));

      // Optional: Send to webhook/API endpoint when ready
      // await fetch('/api/waitlist', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Simulate a brief delay for UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      onSubmit();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
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
          Your journey is mapped
        </h3>
        <p className="text-brand-dark/60">
          Join the early access waitlist and we&apos;ll keep you posted.
        </p>
      </div>

      {/* Location Badge */}
      {journeyData.location && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-brand-dark/70">
          <MapPin className="w-3.5 h-3.5" />
          <span>{journeyData.location.country}</span>
          {journeyData.location.detectedAutomatically && (
            <span className="text-brand-dark/40">• Auto-detected</span>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setFirstNameTouched(true)}
              placeholder="John"
              disabled={isSubmitting}
              className={`
                w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400
                ${showFirstNameError 
                  ? "border-red-300 focus:border-red-400" 
                  : "border-gray-200 focus:border-brand-primary"
                }
              `}
            />
            {showFirstNameError && (
              <p className="mt-1 text-xs text-red-500">{firstNameValidation.error}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1.5">
              Last name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setLastNameTouched(true)}
              placeholder="Doe"
              disabled={isSubmitting}
              className={`
                w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400
                ${showLastNameError 
                  ? "border-red-300 focus:border-red-400" 
                  : "border-gray-200 focus:border-brand-primary"
                }
              `}
            />
            {showLastNameError && (
              <p className="mt-1 text-xs text-red-500">{lastNameValidation.error}</p>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="john@example.com"
            disabled={isSubmitting}
            className={`
              w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-400
              ${showEmailError 
                ? "border-red-300 focus:border-red-400" 
                : "border-gray-200 focus:border-brand-primary"
              }
            `}
          />
          {showEmailError && (
            <p className="mt-1 text-xs text-red-500">{emailValidation.error}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`
            w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
            ${
              isValid && !isSubmitting
                ? "bg-brand-dark text-white hover:bg-brand-dark/90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Joining...
            </>
          ) : (
            "Join the Waitlist"
          )}
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-center text-brand-dark/40">
          By joining, you agree to receive updates about Alutta. No spam, unsubscribe anytime.
        </p>
      </form>
    </div>
  );
}
