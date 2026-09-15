import type { Metadata } from "next";

import ConfirmRemoval from "@/components/researchers/ConfirmRemoval";

export const metadata: Metadata = {
  title: "Confirm your removal",
  description: "Confirm that you want to be removed from Alutta's Supervisor Finder.",
  // A page reached only from a private email link: nothing here for a search
  // engine, and no reason for one to list it.
  robots: { index: false, follow: false },
  alternates: { canonical: "/researchers/confirm" },
};

export default function Page() {
  return <ConfirmRemoval />;
}
