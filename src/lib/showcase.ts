/** The catalogue as the marketing site shows it.
 *
 *  Read from institution-service's public showcase endpoint through the
 *  gateway, server-side, at render time. The homepage's school explorer and
 *  destination panels and the Nigeria page's list of participating
 *  institutions all draw from this one fetch, so they can never disagree about
 *  which schools are on Alutta today.
 *
 *  It is a read of what EXISTS, and the pages are honest about it: when the
 *  catalogue is empty for a country, or the gateway is unreachable, the
 *  sections fall back to illustrative examples and say so, rather than
 *  showing an empty box or pretending a well-known university is a partner. */

// Server-side base (same env the waitlist route uses).
const API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

/** One catalogue row, exactly as institution-service publishes it. */
export type ShowcaseOffering = {
  name: string;
  city: string;
  country: string;
  country_code: string;
  programme: string;
  level: string;
  level_label: string;
  alutta_submits: boolean;
};

/** One school, with every programme the catalogue lists for it. The site
 *  shows schools, not rows; a university with three master's programmes is
 *  one card with three lines, not three cards. */
export type ShowcaseSchool = {
  name: string;
  city: string;
  country: string;
  countryCode: string;
  programmes: string[];
  levels: string[];
  aluttaSubmits: boolean;
};

export type Showcase = {
  schools: ShowcaseSchool[];
  /** Active rows in the whole catalogue, before any country filter. */
  total: number;
  /** True when the gateway could not be reached; the pages then show their
   *  illustrative examples instead of an empty catalogue. */
  failed: boolean;
};

export const EMPTY_SHOWCASE: Showcase = { schools: [], total: 0, failed: false };

/** Group rows into schools, keeping the catalogue's own order (country, then
 *  name). Programmes are de-duplicated and capped so a card stays a card. */
export function groupSchools(items: ShowcaseOffering[]): ShowcaseSchool[] {
  const byKey = new Map<string, ShowcaseSchool>();
  for (const row of items) {
    if (!row?.name || !row?.country_code) continue;
    const key = `${row.country_code}|${row.name}`;
    let school = byKey.get(key);
    if (!school) {
      school = {
        name: row.name,
        city: row.city || "",
        country: row.country || "",
        countryCode: row.country_code.toUpperCase(),
        programmes: [],
        levels: [],
        aluttaSubmits: false,
      };
      byKey.set(key, school);
    }
    if (row.programme && !school.programmes.includes(row.programme) && school.programmes.length < 6) {
      school.programmes.push(row.programme);
    }
    if (row.level_label && !school.levels.includes(row.level_label)) {
      school.levels.push(row.level_label);
    }
    school.aluttaSubmits = school.aluttaSubmits || row.alutta_submits === true;
  }
  return [...byKey.values()];
}

/** Fetch the showcase, optionally for a set of ISO country codes.
 *
 *  Cached for five minutes by Next's fetch cache (the endpoint says the same
 *  in Cache-Control), so a burst of traffic is one read of the catalogue and a
 *  school priced in the workspace shows within that window. */
export async function fetchShowcase(opts: { countries?: string[]; limit?: number } = {}): Promise<Showcase> {
  const params = new URLSearchParams();
  if (opts.countries?.length) params.set("country", opts.countries.join(","));
  params.set("limit", String(Math.min(Math.max(opts.limit ?? 120, 1), 200)));
  try {
    const res = await fetch(`${API_URL}/v1/institutions/public/showcase/?${params}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { items?: ShowcaseOffering[]; total?: number };
    return {
      schools: groupSchools(Array.isArray(data.items) ? data.items : []),
      total: typeof data.total === "number" ? data.total : 0,
      failed: false,
    };
  } catch {
    // "Could not reach the catalogue" and "nothing is listed" are different
    // facts; the pages show examples in both cases but only the first is an
    // outage worth a log line.
    return { ...EMPTY_SHOWCASE, failed: true };
  }
}

/** The file under /public/images for a destination's photo, by ISO code.
 *  Schools in a country without a photo share the graduates picture. */
export function destinationImage(countryCode: string): string {
  const file: Record<string, string> = {
    US: "destination-usa.jpg",
    GB: "destination-uk.jpg",
    CA: "destination-canada.jpg",
    AU: "destination-australia.jpg",
    CN: "destination-china.jpg",
  };
  return `/images/${file[countryCode.toUpperCase()] ?? "journey-graduates.jpg"}`;
}
