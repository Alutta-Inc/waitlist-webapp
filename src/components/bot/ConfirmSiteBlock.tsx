"use client";

import ConfirmLink, { type ConfirmCopy } from "@/components/confirm/ConfirmLink";

/** /bot/confirm: where the site block email's link lands, for a university's
 *  web team. The rules (fragment token, one button, four states) are
 *  ConfirmLink's. */
const copy: ConfirmCopy = {
  eyebrow: "ALUTTABOT",
  heading: "Stop AluttaBot visiting your site.",
  body: "Once you confirm, AluttaBot will not fetch any page on your university’s website again. Researchers can still appear in Supervisor Finder from their public publication record.",
  button: "Stop AluttaBot visiting our site",
  quiet: "Did not ask for this? Close this page and nothing will change.",
  doneEyebrow: "BLOCK CONFIRMED",
  doneHeading: "AluttaBot will stay away.",
  doneBody: (data) => {
    const domain = typeof data.domain === "string" && data.domain ? data.domain : "your website";
    return `AluttaBot will not fetch another page from ${domain}. You do not need to change your robots.txt.`;
  },
  askAgainHref: "/bot#stop",
  askAgainLabel: "Ask again",
};

export default function ConfirmSiteBlock() {
  return <ConfirmLink endpoint="/api/bot/block/confirm" copy={copy} successKey="blocked" />;
}
