# Alutta — Marketing Site (`alutta.com`)

The public marketing site and the top of the funnel. It tells the story, captures
the **waitlist**, lists open **careers**, and streams first-party **analytics**.

Built with **Next.js 16** (App Router) · **React 19** · **TypeScript** ·
**Tailwind CSS**.

The site owns no data of its own — every signup, job listing, and event is handed
to an Alutta backend service behind `api.alutta.com`. This app is a presentation
and edge-validation layer, nothing more.

---

## Deployed on Vercel — a separate failure domain, on purpose

Every other Alutta frontend (workspace, forms, bookings, careers, field) is a
Docker image behind our nginx on Hetzner. The marketing site is different: it
deploys to **Vercel**, deliberately **off** the Hetzner box.

`alutta.com` must stay up when the box or an nginx reload is down — which is
exactly when you most want the marketing site (and the waitlist) reachable. Vercel
also runs the Next.js server routes natively, so there's no adapter to maintain.

> **Not containerised, by design.** Adding a Dockerfile here would fold the
> marketing site back into the very infrastructure it is meant to survive.

---

## A website, not an app

alutta.com is the company's front door: what Alutta is, what it does, how it
works, and one way in. The student product is a separate app on its own host
(`NEXT_PUBLIC_STUDENT_APP_URL`, app.alutta.com), and the two must not be mistaken for
each other. So this site ships **no web app manifest** and never offers to be
installed; the one icon it declares is the favicon and the bookmark icon iOS
asks for. The `SoftwareApplication` structured data names the product at the
app's address, not this one.

The homepage carries no form. It used to open with the waitlist form beside the
headline, which made it read as a signup funnel; the form now has a page of its
own, and every "join" link on the site (header, banner, journey section, footer,
the closing band) lands there. The placeholder explainer video is gone too; it
returns when there is a film.

## The waitlist

The waitlist used to live in Supabase. It now lives in Alutta's own
**customer-service**, so signups are worked from the **workspace** alongside every
other customer record. This app never touches a database or sends an email.

**It has one page, `/waitlist`.** A shared referral link (`?ref=CODE`) opens it
with the code filled in. The page says what happens next (a confirmation, access
opened in small groups, nobody asked for money) beside the form, and links
existing students to the app's sign-in, under the form and as the header's
button on that page (where "join the waitlist" would point at itself).

```
/waitlist → WaitlistForm (client)
   └─ POST /api/waitlist                       (Next server route)
        ├─ verify Cloudflare Turnstile          (bot guard, server-side)
        └─ POST ${ALUTTA_API_URL}/v1/customers/waitlist/   (customer-service)
              → idempotent by email, assigns the referral code, and queues the
                confirmation email via its own outbox → notification-service.
```

- **Idempotent by email** — a repeat signup returns the existing referral code
  (`200`); a new one is `201`. The UI says "already on the list" vs "you're on the
  list" accordingly.
- **Attribution preserved** — `source` (`waitlist`, the page; older rows read `hero` / `final_cta`), `utm_source` → `channel`,
  `utm_medium`, `utm_campaign`, `program`, and `referred_by` (from `?ref=CODE`,
  which also pre-fills the form) all ride along.
- **No email code here** — the branded confirmation email is customer-service's
  job (its transactional outbox), not the website's.
- **Destination is the routing signal** — the form asks where the student intends
  to *study*, and **Nigeria is one of the answers**. A Nigerian student applying to a
  Nigerian private university is a customer of the domestic admissions track, and this
  field is what identifies them. It is also the only measurement of whether that demand
  exists, which is why it was added before anything was built for them.

### Input rules

This route is the only place an anonymous stranger can put text into Alutta's systems,
and what they type is stored, shown to staff, and interpolated into an email. The rules
live in `src/lib/waitlist-input.ts`:

- **Country and destination are checked against the list**, not inspected for danger, and
  their ISO codes are derived server-side — a caller cannot pair a name with someone
  else's code, and those two fields have no injectable surface at all.
- **Reject, never sanitise.** Markup, encoded markup, `javascript:`/`data:` URLs, `on*=`
  handlers, control characters and bidi overrides are refused. A name containing a tag is
  not a name with a problem to strip out; it is not a name.
- **Caps everywhere**, including on the request body, which is size-checked *before* it is
  parsed.
- **Attribution is best effort.** `referredBy`, `source` and the `utm_*` values arrive from
  the URL and are outside anyone's control — ad platforms emit commas, pipes and colons
  routinely. A value that does not fit is **dropped, not fatal**. Losing a tag costs a row
  in a report; losing the signup costs the person.
- **Rate limits are generous on purpose** (60 requests / 10 minutes per address) with a
  much tighter failure budget (15). This audience shares addresses — a cybercafe, a
  university lab, a whole mobile network behind carrier NAT — so a tight per-IP cap
  locks out the students we are trying to reach. Attackers generate *rejected* requests;
  shared networks do not. Turnstile is the gate; this is a brake.

customer-service enforces the same rules again (`customers/safe_text.py`), because the
endpoint is public and this site is not the only thing that can reach it.

---

## Careers

`/careers` renders open roles fetched from **recruitment-service**'s public,
indexable endpoint (`${NEXT_PUBLIC_CAREERS_URL}/v1/recruitment/jobs/public/`). The
dedicated, SEO-optimised careers app is `careers.alutta.com`; this page is the
marketing-site entry point to it.

---

## Analytics

First-party page and interaction events are sent to **analytics-service**'s ingest
(`${NEXT_PUBLIC_ANALYTICS_URL}/v1/analytics/collect/`) — see
[`src/lib/analytics.ts`](src/lib/analytics.ts) and
[`src/components/Analytics.tsx`](src/components/Analytics.tsx). No third-party
tracker; the data lands in our own pipeline and surfaces on the workspace's
Website-analytics page.

---

## Environment variables

Server-only vars are unprefixed; anything the browser needs is `NEXT_PUBLIC_*`
(and is therefore public). Set these in **Vercel → Settings → Environment
Variables**.

| Variable | Scope | Value / purpose |
| --- | --- | --- |
| `ALUTTA_API_URL` | server | `https://api.alutta.com` — the gateway the waitlist route forwards to. |
| `TURNSTILE_SECRET_KEY` | server | Cloudflare Turnstile secret; the waitlist route verifies the token with it. **Required in production.** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | Turnstile site key; renders the widget on the form. |
| `NEXT_PUBLIC_CAREERS_URL` | client | `https://api.alutta.com` — recruitment-service public jobs. |
| `NEXT_PUBLIC_ANALYTICS_URL` | client | `https://api.alutta.com` — analytics ingest (defaults to this if unset). |
| `NEXT_PUBLIC_STUDENT_APP_URL` | client | The student app, `https://app.alutta.com` (the default). Sign-in links cross to it. Named for the student app because the older `NEXT_PUBLIC_APP_URL` was pointed at the workspace in one environment and sent students to a 404. |
| `TURNSTILE_DISABLED` / `NEXT_PUBLIC_TURNSTILE_DISABLED` | both | `true` **only** in local dev to skip Turnstile; never set in production. |

> There is **no** Supabase, Resend, or admin-password config any more — those were
> removed in the customer-service cutover.

---

## Local development

```bash
cp .env.example .env.local     # fill in the vars above
npm install
npm run dev                    # http://localhost:3000
```

For local work without a Turnstile widget, set `TURNSTILE_DISABLED=true` and
`NEXT_PUBLIC_TURNSTILE_DISABLED=true` in `.env.local` (only honoured when
`NODE_ENV !== production`). Point `ALUTTA_API_URL` at your local gateway
(`http://localhost:8080`) to exercise the full signup path against a local
customer-service.

---

## Deployment

Git-integrated on Vercel:

- a push to **any branch** builds a **preview**;
- a merge to **`main`** promotes to **production** (`alutta.com`).

Set the env vars above for **both** Production and Preview before the first
cutover deploy, or the live waitlist breaks (Turnstile-required / wrong API URL).

---

## Routes

| Path | What |
| --- | --- |
| `/` | The company homepage: message, benefits, features, how it works, one CTA |
| `/waitlist` | The waitlist form, and where every "join" link and shared referral link lands |
| `/careers` | Open roles (from recruitment-service) |
| `/privacy`, `/terms` | Legal |
| `/api/waitlist` | Server route: Turnstile verify → customer-service (`POST`). `GET` is a health ping. |
| `/api/geo` | Client geo lookup for country pre-fill |

---

## Structure

```text
src/
├── app/
│   ├── api/waitlist/route.ts   ← Turnstile verify → customer-service
│   ├── careers/page.tsx        ← open roles
│   ├── waitlist/page.tsx       ← the waitlist form's page
│   ├── layout.tsx, page.tsx    ← shell + homepage
│   ├── robots.ts, sitemap.ts
├── components/
│   ├── Analytics.tsx           ← first-party analytics
│   ├── careers/                ← roles list
│   ├── layout/                 ← header, footer, homepage sections
│   ├── waitlist/WaitlistCard.tsx ← the form in its card
│   └── ui/WaitlistForm.tsx     ← the waitlist form
└── lib/
    ├── analytics.ts            ← analytics-service ingest
    ├── careers.ts              ← recruitment-service public jobs
    ├── site.ts                 ← where the app lives, as distinct from this site
    └── utils.ts
```

---

Questions: `hello@alutta.com`.
