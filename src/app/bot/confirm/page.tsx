import type { Metadata } from "next";

import ConfirmSiteBlock from "@/components/bot/ConfirmSiteBlock";

export const metadata: Metadata = {
  title: "Stop AluttaBot visiting your site",
  description: "Confirm that AluttaBot, Alutta's web crawler, should stop visiting your website.",
  // Reached only from a private email link.
  robots: { index: false, follow: false },
  alternates: { canonical: "/bot/confirm" },
};

export default function Page() {
  return <ConfirmSiteBlock />;
}
