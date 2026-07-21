import { NextRequest, NextResponse } from "next/server";

// The waitlist now lives in Alutta's own customer-service (behind the API
// gateway), not Supabase. This route validates + verifies Turnstile, then hands
// the signup to `POST /v1/customers/waitlist/`, which is idempotent by email,
// assigns the referral code, and sends the confirmation email via the
// transactional outbox → notification-service. No database or email code here.
const ALUTTA_API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

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
    const { firstName, email, country, countryCode, destination, destinationCode, program, referredBy, source, utm, turnstileToken } = body;
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
    // The canonical alpha-2 code, when the form knew it. customer-service
    // normalizes either way, so a missing code just falls back to the name.
    const cleanCountryCode = typeof countryCode === "string" ? countryCode.trim() : "";
    const cleanDestinationCode = typeof destinationCode === "string" ? destinationCode.trim() : "";

    // ── Hand the signup to customer-service ──────────────────
    // It is idempotent by email, assigns the referral code, and queues the
    // confirmation email via its outbox. Full attribution is preserved:
    // utm_source is carried as `channel`, plus utm_medium/utm_campaign and the
    // study program.
    let res: Response;
    try {
      res = await fetch(`${ALUTTA_API_URL}/v1/customers/waitlist/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          country: cleanCountry,
          country_code: cleanCountryCode,
          destination: cleanDestination,
          destination_code: cleanDestinationCode,
          source: source || "hero",
          channel: utm?.source || "",
          utm_medium: utm?.medium || "",
          utm_campaign: utm?.campaign || "",
          program: program || "",
          referred_by: referredBy ? String(referredBy).toUpperCase() : "",
        }),
      });
    } catch (e) {
      console.error("customer-service unreachable:", e);
      return NextResponse.json({ error: "Failed to save your details. Please try again." }, { status: 502 });
    }

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      referral_code?: string;
      error?: { message?: string };
    };

    if (!res.ok) {
      console.error("customer-service waitlist error:", res.status, data);
      return NextResponse.json(
        { error: data?.error?.message || "Failed to save your details. Please try again." },
        { status: 502 }
      );
    }

    // 201 = brand-new signup, 200 = already on the list (idempotent).
    const alreadySignedUp = res.status === 200;
    return NextResponse.json({
      success: true,
      alreadySignedUp,
      referralCode: data.referral_code,
      message: alreadySignedUp ? "You are already on the waitlist!" : "You are on the waitlist!",
    });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Alutta waitlist API" });
}
