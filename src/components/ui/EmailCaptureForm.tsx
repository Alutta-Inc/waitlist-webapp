"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface EmailCaptureFormProps {
  onSuccess?: () => void;
}

export default function EmailCaptureForm({ onSuccess }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Call onSuccess callback after a delay if provided
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display font-medium text-2xl text-brand-dark mb-2">
          You&apos;re on the list!
        </h3>
        <p className="text-gray-600">
          We&apos;ll notify you when Alutta is ready for you.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display font-medium text-2xl text-brand-dark mb-2 text-center">
        Get Early Access
      </h3>
      <p className="text-gray-600 text-center mb-6">
        Be the first to know when we launch.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-dark text-white py-3 rounded-lg font-semibold hover:bg-brand-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Notify Me"}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-4">
        No spam, ever. Unsubscribe anytime.
      </p>
    </div>
  );
}