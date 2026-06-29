import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Primary greens (from logo + style guide)
          primary: "#029b47",       // Logo solid green
          "primary-light": "#13CA58", // Malachite (style guide)
          "primary-vivid": "#00d45f", // Logo gradient start
          "primary-mid": "#39b54a",   // Logo gradient end

          // Dark backgrounds / text
          dark: "#003024",          // Burnham — deep forest green
          iridium: "#354440",       // Iridium — muted dark green (body text)

          // Backgrounds
          bg: "#FFFFEB",            // Ivory
          "bg-alt": "#f5f7f2",      // Softer off-white tint

          // Accents
          accent: "#13CA58",        // Malachite — CTA highlights
          turbo: "#FFCC33",         // Yellow accent
          lava: "#FF8533",          // Orange accent
        },
      },
      fontFamily: {
        display: ["var(--font-mierb)", "Arial", "sans-serif"],
        body: ["var(--font-mierb)", "Arial", "sans-serif"],
      },
      spacing: {
        "75": "18.75rem",
        "87.5": "21.875rem",
        "100": "25rem",
        "150": "37.5rem",
        "22.5": "5.625rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
