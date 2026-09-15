import type { Metadata } from "next";

import ResearchersPage from "@/components/researchers/ResearchersPage";

export const metadata: Metadata = {
  title: "For researchers",
  description:
    "What Alutta's Supervisor Finder shows about researchers, where it comes from, and how to ask to be removed.",
  alternates: { canonical: "/researchers" },
  openGraph: {
    title: "For researchers | Alutta",
    description: "What Supervisor Finder shows about researchers, and how to ask to be removed.",
    type: "website",
  },
};

export default function Page() {
  return <ResearchersPage />;
}
