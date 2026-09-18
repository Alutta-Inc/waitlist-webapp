import type { Metadata } from "next";

import PartnersPage from "@/components/partners/PartnersPage";

export const metadata: Metadata = {
  title: "For institutions",
  description:
    "The Alutta partnership pack: what a partnership gives your institution, how applications reach you, and what it costs. Joining is free.",
  alternates: { canonical: "/partners" },
  openGraph: {
    title: "For institutions | Alutta",
    description: "What a partnership with Alutta gives your institution, how it works, and what it costs.",
    type: "website",
  },
};

export default function Page() {
  return <PartnersPage />;
}
