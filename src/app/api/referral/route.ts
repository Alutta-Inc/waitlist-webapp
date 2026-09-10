import { NextRequest, NextResponse } from "next/server";

import { REFERRAL } from "@/lib/waitlist-input";

// GET /api/referral?code=ABCD1234 — is this referral code real, and whose?
//
// The waitlist form used to show "Referred by a friend" for ANY ?ref= value
// in the URL, which told a visitor nothing and told a typo nothing either.
// customer-service answers with the referrer's first name (only), so the form
// can say "Amara referred you" when the code is real and stay quiet when it is
// not. See ReferralCheckView there for why a first name is acceptable to
// hand out: codes are 8 characters from a 36-character alphabet, and the
// service throttles the lookup on its own side.
//
// The code's shape is checked HERE before anything is forwarded, so junk never
// costs the gateway a request, and the answer is cached briefly per code.
const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
  const headers = { "Cache-Control": "private, max-age=300" };

  if (!REFERRAL.test(code)) {
    return NextResponse.json({ valid: false }, { headers });
  }

  try {
    const res = await fetch(`${ALUTTA_API_URL}/v1/customers/referrals/${encodeURIComponent(code)}/`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      return NextResponse.json({ valid: false }, { headers });
    }
    const data = (await res.json()) as { valid?: boolean; referrer_first_name?: string };
    return NextResponse.json(
      {
        valid: data.valid === true,
        referrerFirstName: data.valid === true ? String(data.referrer_first_name || "").slice(0, 40) : "",
      },
      { headers },
    );
  } catch {
    // An outage is not "invalid": the form keeps the code and sends it with
    // the signup, where customer-service checks it again. It just cannot show
    // a name right now.
    return NextResponse.json({ valid: null }, { headers: { "Cache-Control": "private, no-store" } });
  }
}
