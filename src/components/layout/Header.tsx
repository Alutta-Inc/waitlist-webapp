"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { assetUrl } from "@/lib/assets";

// Anchors are written as /#section so they work from /waitlist and /careers
// too, not only from the page that holds the section.
const navItems = [
  { label: "Features", href: "/#features", track: "nav-features" },
  { label: "How it works", href: "/#how-it-works", track: "nav-how-it-works" },
  { label: "Careers", href: "/careers", track: "nav-careers" },
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
      isScrolled ? "lg:bg-brand-bg/95 lg:backdrop-blur-sm lg:shadow-sm bg-brand-bg" : "bg-brand-bg"
    }`}>
      <div className="px-8 sm:px-8 lg:px-10 xl:px-10">
        <div className="h-16 lg:h-20 grid grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src={assetUrl("/brand/logo-horizontal-coloured.svg")}
              alt="Alutta"
              width={98}
              height={24}
              priority
              className="h-6 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} data-track={item.track} className="text-brand-iridium/70 hover:text-brand-dark transition-colors font-medium">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex justify-end">
            <Link
              href="/waitlist"
              data-track="cta-header"
              className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark/90 transition-colors"
            >
              Join the waitlist
            </Link>
          </div>

          <div className="flex lg:hidden justify-end">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-brand-dark" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-brand-primary/10">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                  data-track={item.track}
                  className="text-brand-iridium/70 hover:text-brand-dark transition-colors font-medium py-2">
                  {item.label}
                </Link>
              ))}
              <Link href="/waitlist" onClick={() => setIsMobileMenuOpen(false)} data-track="cta-header"
                className="inline-flex items-center justify-center bg-brand-dark text-white px-5 py-3 rounded-full text-sm font-semibold">
                Join the waitlist
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
