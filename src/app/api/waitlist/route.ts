import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendWaitlistConfirmation } from "@/lib/email";
import { customAlphabet } from "nanoid";

// 8-char alphanumeric referral codes — easy to share
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, email, country, destination, program, referredBy, source, utm } = body;

    // ── Validation ──────────────────────────────────────────
    if (!firstName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = firstName.trim();
    const supabaseAdmin = getSupabaseAdmin();

    // ── Check for duplicate ──────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("waitlist")
      .select("id, referral_code")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      // Already signed up — return their referral code gracefully
      return NextResponse.json({
        success: true,
        alreadySignedUp: true,
        referralCode: existing.referral_code,
        message: "You're already on the waitlist!",
      });
    }

    // ── Validate referral code if provided ───────────────────
    let validReferredBy: string | null = null;
    if (referredBy) {
      const { data: referrer } = await supabaseAdmin
        .from("waitlist")
        .select("id")
        .eq("referral_code", referredBy.toUpperCase())
        .maybeSingle();
      if (referrer) validReferredBy = referredBy.toUpperCase();
    }

    const referralCode = nanoid();

    // ── Insert into database ─────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || null;

    const { error: insertError } = await supabaseAdmin
      .from("waitlist")
      .insert({
        first_name: cleanName,
        email: cleanEmail,
        country: country || null,
        destination: destination || null,
        program: program || null,
        referral_code: referralCode,
        referred_by: validReferredBy,
        source: source || "hero",
        utm_source: utm?.source || null,
        utm_medium: utm?.medium || null,
        utm_campaign: utm?.campaign || null,
        ip_address: ip,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to save your details. Please try again." }, { status: 500 });
    }

    // ── Send confirmation email (non-blocking) ───────────────
    sendWaitlistConfirmation({
      firstName: cleanName,
      email: cleanEmail,
      referralCode,
    }).catch((err) => console.error("Email send failed:", err));

    return NextResponse.json({
      success: true,
      referralCode,
      message: "You're on the waitlist!",
    });

  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Alutta waitlist API" });
}
