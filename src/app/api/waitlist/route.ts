import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendWaitlistConfirmation } from "@/lib/email";
import { customAlphabet } from "nanoid";

// 8-char alphanumeric referral codes — easy to share
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

function isTurnstileDisabled() {
  return process.env.NODE_ENV !== "production" && process.env.TURNSTILE_DISABLED === "true";
}

async function verifyTurnstileToken(token: string, remoteIp: string | null) {
  if (isTurnstileDisabled()) {
    return true;
  }

  if (!process.env.TURNSTILE_SECRET_KEY) {
    throw new Error("TURNSTILE_SECRET_KEY is required.");
  }

  const formData = new FormData();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  if (remoteIp) formData.append("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, email, country, destination, program, referredBy, source, utm, turnstileToken } = body;
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || null;

    // ── Validation ──────────────────────────────────────────
    if (!firstName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    if (!country?.trim() || !destination?.trim()) {
      return NextResponse.json({ error: "Country and study destination are required." }, { status: 400 });
    }

    if (!isTurnstileDisabled() && (!turnstileToken || typeof turnstileToken !== "string")) {
      return NextResponse.json({ error: "Please complete the security check." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const turnstileValid = await verifyTurnstileToken(String(turnstileToken || ""), ip);
    if (!turnstileValid) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 403 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = firstName.trim();
    const cleanCountry = country.trim();
    const cleanDestination = destination.trim();
    const supabaseAdmin = getSupabaseAdmin();

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

    // ── Check for duplicate ──────────────────────────────────
    const { data: existing } = await supabaseAdmin
      .from("waitlist")
      .select("id, referral_code")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existing) {
      const updatePayload = {
        country: cleanCountry,
        destination: cleanDestination,
        program: program || null,
        source: source || "hero",
        utm_source: utm?.source || null,
        utm_medium: utm?.medium || null,
        utm_campaign: utm?.campaign || null,
        ip_address: ip,
        ...(validReferredBy ? { referred_by: validReferredBy } : {}),
      };

      const { error: updateError } = await supabaseAdmin
        .from("waitlist")
        .update(updatePayload)
        .eq("id", existing.id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return NextResponse.json({ error: "Failed to update your details. Please try again." }, { status: 500 });
      }

      // Already signed up - return their referral code gracefully.
      return NextResponse.json({
        success: true,
        alreadySignedUp: true,
        referralCode: existing.referral_code,
        message: "You are already on the waitlist!",
      });
    }

    const referralCode = nanoid();

    // ── Insert into database ─────────────────────────────────
    const { error: insertError } = await supabaseAdmin
      .from("waitlist")
      .insert({
        first_name: cleanName,
        email: cleanEmail,
        country: cleanCountry,
        destination: cleanDestination,
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

    // ── Send confirmation email ──────────────────────────────
    const emailResult = await sendWaitlistConfirmation({
      firstName: cleanName,
      email: cleanEmail,
      referralCode,
    });

    if (emailResult.error) {
      // User is saved — log the error but don't block the success response.
      console.error("Resend delivery error:", JSON.stringify(emailResult.error));
    }

    return NextResponse.json({
      success: true,
      referralCode,
      message: "You are on the waitlist!",
    });

  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Alutta waitlist API" });
}
