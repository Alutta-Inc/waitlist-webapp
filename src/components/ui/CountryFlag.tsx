"use client";

interface FlagProps {
  className?: string;
}

function USFlag({ className = "w-10 h-10" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="circleClipUS">
          <circle cx="256" cy="256" r="256" />
        </clipPath>
      </defs>
      <g clipPath="url(#circleClipUS)">
        <rect fill="#bf0a30" width="512" height="512" />
        <rect fill="#fff" y="39" width="512" height="40" />
        <rect fill="#fff" y="118" width="512" height="40" />
        <rect fill="#fff" y="197" width="512" height="40" />
        <rect fill="#fff" y="276" width="512" height="40" />
        <rect fill="#fff" y="355" width="512" height="40" />
        <rect fill="#fff" y="434" width="512" height="40" />
        <rect fill="#002868" width="230" height="275" />
      </g>
    </svg>
  );
}

function UKFlag({ className = "w-10 h-10" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="circleClipUK">
          <circle cx="256" cy="256" r="256" />
        </clipPath>
      </defs>
      <g clipPath="url(#circleClipUK)">
        <rect fill="#012169" width="512" height="512" />
        <path fill="#fff" d="M0 0l512 512m0-512L0 512" strokeWidth="100" stroke="#fff" />
        <path d="M0 0l512 512m0-512L0 512" strokeWidth="60" stroke="#c8102e" />
        <path fill="#fff" d="M256 0v512M0 256h512" strokeWidth="170" stroke="#fff" />
        <path d="M256 0v512M0 256h512" strokeWidth="100" stroke="#c8102e" />
      </g>
    </svg>
  );
}

function CanadaFlag({ className = "w-10 h-10" }: FlagProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="circleClipCA">
          <circle cx="256" cy="256" r="256" />
        </clipPath>
      </defs>
      <g clipPath="url(#circleClipCA)">
        <rect fill="#fff" width="512" height="512" />
        <rect fill="#d52b1e" width="128" height="512" />
        <rect fill="#d52b1e" x="384" width="128" height="512" />
        <path
          fill="#d52b1e"
          d="M256 100l20 63-55-40h70l-55 40 20-63zm-35 115l-7-22-26 14 10-25-25-9 24-10-2-26 26 17 20-23v28l27 8-27 12zm70 0l7-22 26 14-10-25 25-9-24-10 2-26-26 17-20-23v28l-27 8 27 12zm-35 82v60h-15v-60h-42l9-30 17 9-2-17 21 11 3-25h18l3 25 21-11-2 17 17-9 9 30z"
        />
      </g>
    </svg>
  );
}

interface CountryFlagProps {
  country: "US" | "UK" | "CA";
  className?: string;
}

export default function CountryFlag({ country, className = "w-10 h-10" }: CountryFlagProps) {
  switch (country) {
    case "US":
      return <USFlag className={className} />;
    case "UK":
      return <UKFlag className={className} />;
    case "CA":
      return <CanadaFlag className={className} />;
    default:
      return null;
  }
}