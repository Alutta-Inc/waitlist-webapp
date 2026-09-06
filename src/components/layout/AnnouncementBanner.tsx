import Link from "next/link";

export default function AnnouncementBanner() {
  return (
    <div className="bg-brand-dark text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
        <p className="text-center">
          <span className="text-brand-accent font-medium">Now in private beta.</span>{" "}
          Supporting students leaving their home country to study abroad.{" "}
          <Link
            href="/waitlist"
            data-track="cta-banner"
            className="font-semibold underline underline-offset-4 hover:text-brand-accent transition-colors"
          >
            Join the waitlist
          </Link>
        </p>
      </div>
    </div>
  );
}
