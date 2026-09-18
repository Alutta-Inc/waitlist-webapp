/** Every interaction this site counts, in one list.
 *
 *  THIS FILE IS THE VOCABULARY. A key here is what the tracker emits
 *  (`data-track="<key>"` on a clickable, `data-track-view="<key>"` on a
 *  section, or an explicit `track("<key>")`), and it is the same string
 *  analytics-service seeds as an EventTag so the workspace's Website page
 *  lists it with a name and a count instead of a bare slug.
 *
 *  Two rules, both enforced by scripts/tracking.test.mjs:
 *
 *   * nothing emits a key that is not listed here, so a typo cannot quietly
 *     produce an event nobody is counting;
 *   * nothing is listed here that nothing emits, so the workspace never shows
 *     a tag that can only ever read zero.
 *
 *  Keys are slugs (lower case, hyphens): EventTag.key is a SlugField.
 *
 *  NAMING. Joining is the one conversion this site exists for, so every place
 *  that offers it gets its OWN key (`join-hero`, `join-closing`, …). Knowing
 *  the total is useless; knowing which band earns it is the whole question.
 *  Everything else is named for the thing, not the place.
 */

export type TrackedEvent = {
  /** The token emitted, and the EventTag key in analytics-service. */
  key: string;
  /** What it is called in the workspace. */
  name: string;
};

/** Offers to join the waitlist, one per placement. */
export const JOIN_EVENTS: TrackedEvent[] = [
  { key: "join-announcement", name: "Join: announcement strip" },
  { key: "join-header", name: "Join: header button" },
  { key: "join-hero", name: "Join: homepage hero" },
  { key: "join-explainer", name: "Join: explainer video" },
  { key: "join-journey", name: "Join: journey explorer" },
  { key: "join-arrival", name: "Join: life after arrival" },
  { key: "join-audience", name: "Join: who Alutta is for" },
  { key: "join-closing", name: "Join: closing invitation" },
  { key: "join-footer", name: "Join: footer" },
  { key: "join-ng-hero", name: "Join: Nigeria hero" },
  { key: "join-ng-about", name: "Join: Nigeria, the Alutta way" },
  { key: "join-ng-closing", name: "Join: Nigeria closing" },
];

/** The moments that are the point: somebody joined, or passed it on. */
export const CONVERSION_EVENTS: TrackedEvent[] = [
  { key: "waitlist-signup", name: "Waitlist signup" },
  { key: "share-referral", name: "Referral link shared" },
  { key: "copy-referral", name: "Referral link copied" },
  { key: "referral-claim-place", name: "Invitation accepted" },
  { key: "referral-code-open", name: "Referral code field opened" },
];

/** Looking around: what people open, read and try before they decide. */
export const ENGAGEMENT_EVENTS: TrackedEvent[] = [
  { key: "explainer-open", name: "Explainer opened" },
  { key: "destination-explore", name: "Destination explored" },
  { key: "journey-stage", name: "Journey stage opened" },
  { key: "school-save", name: "Demo school saved" },
  { key: "faq-open", name: "Question opened" },
  { key: "market-switch", name: "Region switched" },
  { key: "waitlist-explore", name: "Waitlist page: take a look around" },
  { key: "nav-about", name: "Nav: the Alutta way" },
  { key: "nav-destinations", name: "Nav: destinations" },
  { key: "nav-journey", name: "Nav: your journey" },
  { key: "nav-questions", name: "Nav: questions" },
  { key: "nav-profile", name: "Nav: your profile (Nigeria)" },
];

/** The people who are not students: schools, funders, candidates, researchers. */
export const PARTNER_EVENTS: TrackedEvent[] = [
  { key: "pack-institutions", name: "Pack: institutions opened" },
  { key: "pack-funders", name: "Pack: funding bodies opened" },
  { key: "pack-read-document", name: "Pack: document read" },
  { key: "pack-arrange-call", name: "Pack: call requested" },
  { key: "careers-open", name: "Careers opened" },
  { key: "careers-see-roles", name: "Careers: roles jumped to" },
  { key: "careers-role-open", name: "Careers: role opened" },
  { key: "researcher-removal-submit", name: "Researcher: asked to be left out" },
  { key: "bot-block-submit", name: "AluttaBot: site block requested" },
];

/** Getting to the product. */
export const UTILITY_EVENTS: TrackedEvent[] = [
  { key: "signin", name: "Sign in" },
  { key: "social-follow", name: "Social profile opened" },
];

/** How far down the homepage people actually get (`data-track-view`). */
export const SECTION_VIEW_EVENTS: TrackedEvent[] = [
  { key: "seen-journey", name: "Seen: your journey" },
  { key: "seen-destinations", name: "Seen: destinations" },
  { key: "seen-arrival", name: "Seen: life after arrival" },
  { key: "seen-audiences", name: "Seen: who Alutta is for" },
  { key: "seen-questions", name: "Seen: questions" },
];

export const TRACKED_EVENTS: TrackedEvent[] = [
  ...JOIN_EVENTS,
  ...CONVERSION_EVENTS,
  ...ENGAGEMENT_EVENTS,
  ...PARTNER_EVENTS,
  ...UTILITY_EVENTS,
  ...SECTION_VIEW_EVENTS,
];

export const TRACKED_KEYS: string[] = TRACKED_EVENTS.map((e) => e.key);
