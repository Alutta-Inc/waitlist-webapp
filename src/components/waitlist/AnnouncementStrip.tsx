"use client";

import Link from "next/link";
import { ArrowUpRight, Gift } from "lucide-react";

import { useReferral } from "@/lib/use-referral";

/** The strip above the header: the site's standing line, or an invitation.
 *
 *  THE ONE PLACE A REFERRAL IS ANNOUNCED. A link like alutta.com/?ref=EZFAD2WQ
 *  used to land on a page that looked exactly like the one everybody else sees,
 *  so the invitation did nothing, the inviter was never mentioned, and the
 *  visitor had to find the waitlist page themselves. This puts the invitation
 *  where the site already speaks first, and points straight at the form.
 *
 *  The invitation only replaces the usual line once there is a NAME to put in
 *  it. A code still being checked, one that is not ours, or a lookup that could
 *  not answer all leave the strip as it was, so nothing flickers and nothing
 *  claims a friend the visitor does not have.
 */
export function AnnouncementStrip({ joinHref, onJoin }: { joinHref: string; onJoin?: () => void }) {
  const referral = useReferral();
  const inviter = referral.status === "valid" ? referral.referrerName : "";

  const action = (label: string, track: string) =>
    onJoin ? (
      <button type="button" className="atlas-announcement-action" onClick={onJoin} data-track={track}>
        {label} <ArrowUpRight size={13} />
      </button>
    ) : (
      <Link href={joinHref} data-track={track}>
        {label} <ArrowUpRight size={13} />
      </Link>
    );

  if (inviter) {
    return (
      <div className="atlas-announcement atlas-announcement-invite" role="status">
        <Gift size={13} aria-hidden="true" />
        <span>
          <strong>{inviter}</strong> invited you to Alutta.
        </span>
        {action("Claim your place", "referral-claim-place")}
      </div>
    );
  }

  return (
    <div className="atlas-announcement">
      <span className="atlas-status-dot" />
      Your next chapter is calling. {action("Private beta is open", "cta-announcement-waitlist")}
    </div>
  );
}
