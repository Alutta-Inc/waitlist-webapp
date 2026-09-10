import type { Metadata } from "next";
import HomeExperience from "@/components/home/HomeExperience";
import { fetchShowcase } from "@/lib/showcase";

export const metadata: Metadata = { alternates: { canonical: "/", languages: { en: "/", "en-NG": "/ng", "x-default": "/" } } };

export default async function Home() {
  // The schools shown in the explorer and the destination panels come from
  // institution-service's public showcase, read here at render time and
  // revalidated every five minutes. An empty or unreachable catalogue leaves
  // the illustrative examples in place, labelled as such.
  const showcase = await fetchShowcase({ limit: 200 });
  return <HomeExperience showcase={showcase} />;
}
