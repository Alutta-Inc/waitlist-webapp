"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`relative lg:sticky lg:top-0 z-50 transition-all duration-300 ${
      isScrolled ? "lg:bg-white/95 lg:backdrop-blur-sm lg:shadow-sm bg-brand-bg" : "bg-brand-bg"
    }`}>
      <div className="px-8 sm:px-8 lg:px-10 xl:px-10">
        <div className="h-16 lg:h-20 grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center gap-8">
          <Link href="/" className="flex items-center">
            <span className="font-display font-medium text-2xl text-brand-dark">Alutta</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="text-brand-dark/70 hover:text-brand-dark transition-colors font-medium">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex justify-end">
            <a
              href="#journey-builder"
              className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark/90 transition-colors"
            >
              Join Waitlist
            </a>
          </div>

          <div className="flex lg:hidden justify-end">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-brand-dark" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                  className="text-brand-dark/70 hover:text-brand-dark transition-colors font-medium py-2">
                  {item.label}
                </Link>
              ))}
              <a href="#journey-builder" onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center bg-brand-dark text-white px-5 py-3 rounded-full text-sm font-semibold">
                Join Waitlist
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
