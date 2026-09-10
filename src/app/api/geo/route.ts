import { NextRequest, NextResponse } from "next/server";
import { sourceCountries } from "@/lib/journey-data";

const COUNTRY_HEADER_NAMES = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "cloudfront-viewer-country",
];

function findCountryName(countryCode: string | null) {
  if (!countryCode) return null;

  const normalizedCode = countryCode.trim().toUpperCase();
  if (!normalizedCode || normalizedCode === "XX") return null;

  return sourceCountries.find((country) => country.code === normalizedCode)?.name ?? null;
}

export async function GET(req: NextRequest) {
  const countryCode = COUNTRY_HEADER_NAMES
    .map((headerName) => req.headers.get(headerName))
    .find(Boolean)?.trim().toUpperCase() ?? null;

  return NextResponse.json({
    countryCode,
    countryName: findCountryName(countryCode),
  }, { headers: { "Cache-Control": "private, no-store", "Vary": COUNTRY_HEADER_NAMES.join(", ") } });
}
