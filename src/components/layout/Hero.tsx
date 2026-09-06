import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** The first thing alutta.com says.
 *
 *  MESSAGE FIRST, FORM ELSEWHERE. This used to split the fold with the waitlist
 *  form, so the page read as a signup funnel: half a headline beside a card
 *  asking for an email before anyone knew what Alutta was. The form now has a
 *  page of its own (/waitlist), and the hero does one job: say what this is,
 *  for whom, and offer two ways forward, joining or reading on.
 *
 *  No video. The button that was here opened a placeholder id, which is a
 *  promise the site could not keep. It comes back when there is a film. */
export default function Hero() {
  return (
    <section className="relative bg-brand-bg overflow-hidden">
      {/* Warmer light in the bottom-right, the same ground the rest of the page sits on. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 90% 100%, #E8E5E0 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 100% 80%, #F0EDE8 0%, transparent 50%)
          `,
        }}
      />

      {/* Ambient pattern: a few drifting lines and a fading field of dots. */}
      <div className="absolute -top-32 -right-40 w-[980px] h-[760px] pointer-events-none opacity-80 hidden sm:block">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 980 760"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-[heroPatternDrift_18s_ease-in-out_infinite] motion-reduce:animate-none"
        >
          <defs>
            <linearGradient id="heroPatternStroke" x1="120" y1="80" x2="910" y2="620" gradientUnits="userSpaceOnUse">
              <stop stopColor="#029b47" stopOpacity="0.14" />
              <stop offset="0.48" stopColor="#13CA58" stopOpacity="0.1" />
              <stop offset="1" stopColor="#029b47" stopOpacity="0" />
            </linearGradient>
            <pattern id="heroPatternDots" x="0" y="0" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.15" fill="#029b47" fillOpacity="0.12" />
            </pattern>
            <mask id="heroPatternFade">
              <rect width="980" height="760" fill="black" />
              <ellipse cx="690" cy="210" rx="380" ry="290" fill="white" />
              <ellipse cx="330" cy="500" rx="300" ry="190" fill="white" opacity="0.55" />
            </mask>
          </defs>
          <g className="animate-[heroLineFloat_12s_ease-in-out_infinite] motion-reduce:animate-none">
            <path d="M76 574C238 344 444 208 700 166C810 148 891 156 960 184" stroke="url(#heroPatternStroke)" strokeWidth="1.35" strokeLinecap="round" />
            <path d="M38 488C214 282 424 157 684 118C784 103 876 111 946 137" stroke="url(#heroPatternStroke)" strokeWidth="1" strokeLinecap="round" opacity="0.72" />
            <path d="M144 660C318 438 520 314 748 284C836 272 912 282 972 310" stroke="url(#heroPatternStroke)" strokeWidth="1" strokeLinecap="round" opacity="0.52" />
            <path d="M10 612C150 515 286 475 420 492C524 505 612 552 724 548" stroke="url(#heroPatternStroke)" strokeWidth="0.9" strokeLinecap="round" opacity="0.38" />
          </g>
          <g opacity="0.45" className="animate-[heroDotsFloat_16s_ease-in-out_infinite] motion-reduce:animate-none">
            <rect x="238" y="42" width="650" height="560" fill="url(#heroPatternDots)" mask="url(#heroPatternFade)" />
          </g>
        </svg>
      </div>

      {/* A smaller field of dots, bottom-left, fading out towards the corner. */}
      <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none opacity-25 hidden lg:block">
        <svg width="100%" height="100%" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => {
              const x = col * 36 + 18;
              const y = row * 36 + 18;
              const distFromBottomLeft = Math.sqrt(Math.pow(col, 2) + Math.pow(7 - row, 2));
              const opacity = Math.max(0, 1 - distFromBottomLeft * 0.12);
              return <circle key={`bl-${row}-${col}`} cx={x} cy={y} r={2} fill="#13CA58" opacity={opacity * 0.5} />;
            })
          )}
        </svg>
      </div>

      <div className="relative px-6 sm:px-8 lg:px-16 xl:px-24 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-accent text-xl sm:text-2xl leading-tight font-semibold mb-5">
            Your study abroad companion
          </p>

          <h1 className="font-display font-bold text-[46px] sm:text-6xl lg:text-[76px] xl:text-[84px] text-brand-dark leading-[1.04] mb-7 text-balance">
            The all-in-one platform for{" "}
            <span className="text-brand-primary">international students</span>
          </h1>

          <p className="text-xl sm:text-2xl text-brand-dark/80 leading-snug mb-10 max-w-2xl mx-auto text-balance">
            From the first application fee to your first week in a new city, Alutta
            maps every step, handles the payments, and helps you settle in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/waitlist"
              data-track="cta-hero"
              className="inline-flex items-center justify-center gap-2 bg-brand-dark text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-dark/90 transition-colors w-full sm:w-auto"
            >
              Join the waitlist
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/#how-it-works"
              data-track="cta-hero-how"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-dark px-8 py-4 rounded-full text-lg font-semibold border border-brand-dark/15 hover:border-brand-dark/40 transition-colors w-full sm:w-auto"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-6 text-sm text-brand-iridium/70 font-medium">
            Now in private beta. Free to join, and we email you when it is your turn.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes heroPatternDrift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-18px, 14px, 0) scale(1.025); }
        }
        @keyframes heroLineFloat {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 1; }
          50% { transform: translate3d(-28px, 20px, 0); opacity: 0.72; }
        }
        @keyframes heroDotsFloat {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.45; }
          50% { transform: translate3d(22px, -16px, 0); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
