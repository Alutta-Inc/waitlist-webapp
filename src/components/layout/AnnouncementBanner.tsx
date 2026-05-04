export default function AnnouncementBanner() {
  return (
    <div className="bg-brand-dark text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm">
        <p className="text-center">
          <span className="text-brand-accent font-medium">Now available</span>
          {" — "}
          Supporting students heading to the{" "}
          <span className="font-semibold">US</span>,{" "}
          <span className="font-semibold">UK</span>, and{" "}
          <span className="font-semibold">Canada</span>
        </p>
      </div>
    </div>
  );
}
