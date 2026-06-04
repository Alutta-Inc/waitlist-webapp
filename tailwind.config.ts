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
          dark: "#1e3a5f",
          primary: "#1565C0",
          accent: "#0ea5e9",
          bg: "#f8f7f4",
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
