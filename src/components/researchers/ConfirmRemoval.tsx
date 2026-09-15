"use client";

import ConfirmLink, { type ConfirmCopy } from "@/components/confirm/ConfirmLink";

/** /researchers/confirm: where the researcher removal email's link lands. The
 *  rules (fragment token, one button, four states) are ConfirmLink's. */
const copy: ConfirmCopy = {
  eyebrow: "SUPERVISOR FINDER",
  heading: "Confirm your removal.",
  body: "Once you confirm, students will no longer see you in Supervisor Finder, and we will not list you again.",
  button: "Remove me from Supervisor Finder",
  quiet: "Did not ask for this? Close this page and nothing will change.",
  doneEyebrow: "REMOVAL CONFIRMED",
  doneHeading: "You have been removed.",
  doneBody: () => "Students no longer see you in Supervisor Finder, and we will not list you again. You do not need to do anything else.",
  askAgainHref: "/researchers#remove",
  askAgainLabel: "Ask to be removed",
};

export default function ConfirmRemoval() {
  return <ConfirmLink endpoint="/api/researchers/removal/confirm" copy={copy} successKey="removed" />;
}
