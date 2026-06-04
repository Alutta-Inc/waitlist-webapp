import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

export async function GET(req: NextRequest) {
  try {
    // Simple password protection
    const auth = req.headers.get("authorization");
    const password = process.env.ADMIN_PASSWORD;

    if (!password || auth !== `Bearer ${password}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: entries, count, error } = await supabaseAdmin
      .from("waitlist")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin waitlist fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch waitlist data", detail: error.message },
        { status: 500 }
      );
    }

    // Referral stats
    const { data: referralStats, error: referralStatsError } = await supabaseAdmin
      .from("referral_stats")
      .select("*")
      .gt("referral_count", 0)
      .order("referral_count", { ascending: false })
      .limit(20);

    if (referralStatsError) {
      console.error("Admin referral stats fetch error:", referralStatsError);
      return NextResponse.json(
        { error: "Failed to fetch referral stats", detail: referralStatsError.message },
        { status: 500 }
      );
    }

    // By country
    const countryMap: Record<string, number> = {};
    const sourceMap: Record<string, number> = {};
    const destMap: Record<string, number> = {};

    entries?.forEach((e) => {
      if (e.country) countryMap[e.country] = (countryMap[e.country] || 0) + 1;
      if (e.source) sourceMap[e.source] = (sourceMap[e.source] || 0) + 1;
      if (e.destination) destMap[e.destination] = (destMap[e.destination] || 0) + 1;
    });

    return NextResponse.json({
      total: count,
      entries,
      topReferrers: referralStats,
      byCountry: countryMap,
      bySource: sourceMap,
      byDestination: destMap,
    });
  } catch (error) {
    const detail = getErrorMessage(error);
    console.error("Admin API error:", error);
    return NextResponse.json({ error: "Admin API failed", detail }, { status: 500 });
  }
}
