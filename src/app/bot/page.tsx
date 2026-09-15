import type { Metadata } from "next";

import BotPage from "@/components/bot/BotPage";

export const metadata: Metadata = {
  title: "AluttaBot",
  description:
    "AluttaBot is Alutta's web crawler. How to recognise it, what it reads on university websites, and how to limit or block it with robots.txt.",
  alternates: { canonical: "/bot" },
  openGraph: {
    title: "AluttaBot | Alutta",
    description: "Alutta's web crawler: what it reads, and how to limit or block it.",
    type: "website",
  },
};

export default function Page() {
  return <BotPage />;
}
