import type { Metadata } from "next";

import FundersPage from "@/components/packs/FundersPage";

export const metadata: Metadata = {
  title: "For funding bodies",
  description:
    "How scholarship bodies, sponsors and student lenders work with Alutta: your funding shown to the students it was made for. Listing is free, and award money never passes through us.",
  alternates: { canonical: "/funding-bodies" },
  openGraph: {
    title: "For funding bodies | Alutta",
    description: "Your scholarships, grants and loans, shown to the students they were made for.",
    type: "website",
  },
};

export default function Page() {
  return <FundersPage />;
}
