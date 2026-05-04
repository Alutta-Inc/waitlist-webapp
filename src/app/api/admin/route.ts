import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
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
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  // Referral stats
  const { data: referralStats } = await supabaseAdmin
    .from("referral_stats")
    .select("*")
    .gt("referral_count", 0)
    .order("referral_count", { ascending: false })
    .limit(20);

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
}
