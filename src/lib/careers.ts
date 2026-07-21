/**
 * The careers data for alutta.com/careers.
 *
 * This page is the *storefront* — it lists live roles from recruitment-service's
 * public API and links each one to the job board (careers.alutta.com/jobs/{id}),
 * where the full detail + apply flow lives. The marketing site never owns job
 * data; it reads the same public door the job board and Google for Jobs read.
 */

// Server-side base (same env the waitlist route uses). The public jobs endpoint
// is behind the gateway; alutta.com is already in its public CORS allowlist.
const API_URL = process.env.ALUTTA_API_URL || "http://localhost:8080";

// Where a role opens: the job board subdomain. One place to change the host.
const CAREERS_URL =
  process.env.NEXT_PUBLIC_CAREERS_URL || "http://localhost:3004";

export function careersJobUrl(publicId: string): string {
  return `${CAREERS_URL.replace(/\/$/, "")}/jobs/${publicId}`;
}

export function careersHomeUrl(): string {
  return `${CAREERS_URL.replace(/\/$/, "")}`;
}

export type Role = {
  public_id: string;
  title: string;
  team: string;
  employment_type: string;
  location: string;
  country_code: string;
  remote: boolean;
};

export type CareersData = {
  roles: Role[];
  teams: string[];
  employmentTypes: string[];
  failed: boolean;
};

export async function fetchRoles(): Promise<CareersData> {
  try {
    const res = await fetch(`${API_URL}/v1/recruitment/jobs/public/`, {
      // A new posting shows within a minute; a burst of traffic doesn't become a
      // burst of DB reads.
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return {
      roles: data.results ?? [],
      teams: data.facets?.teams ?? [],
      employmentTypes: data.facets?.employment_types ?? [],
      failed: false,
    };
  } catch {
    // "Couldn't reach the job board" and "no vacancies" are different facts —
    // the page distinguishes them rather than showing an empty list on an outage.
    return { roles: [], teams: [], employmentTypes: [], failed: true };
  }
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  temporary: "Temporary",
};

export function employmentLabel(value: string): string {
  return EMPLOYMENT_LABELS[value] || value.replace(/_/g, " ");
}

/** A flag emoji from an ISO alpha-2 code — no asset dependency. Blank for a bad
 *  or empty code, so a remote-only role just shows no flag. */
export function flagEmoji(code: string): string {
  const cc = (code || "").trim().toUpperCase();
  if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** "Lagos, Nigeria" style office label. A remote-only role reads "Remote". */
export function officeLabel(role: Role): string {
  if (role.location && role.location.toLowerCase() !== "remote") return role.location;
  if (role.remote) return "Remote";
  return role.location || "Flexible";
}
