# Website markets

The URL owns the active market. `/` always serves Global; `/ng` serves Nigeria.
Market configuration is in `src/lib/markets.ts`. Add only launched markets and map
supported equivalent routes in `marketPath`; other pages fall back to the market homepage.

The region selector appears in the shared header and both footer implementations.
Explicit choices are remembered in localStorage for 180 days. They suppress the
location invitation but never override a directly visited URL. Dismissal lasts for
the tab session. Storage or geolocation failures leave Global usable.

The optional Nigeria suggestion uses `/api/geo`, not browser language or GPS.
In production the hosting/CDN must supply a visitor country header: `cf-ipcountry`,
`x-vercel-ip-country`, or `cloudfront-viewer-country`. Configure the trusted edge to
overwrite those headers and prevent origin bypass. Country is a suggestion only,
never an access control. Responses are private and not cached. Local development
normally has no country header and should not display the suggestion.

Nigeria signups use the existing API with source `nigeria-waitlist`; study
destination distinguishes domestic interest from international interest. Nigeria
is already part of the server's destination allowlist. Country of residence stays
independent of website market. Nigeria referral links retain `/ng/waitlist`.
No institutional integrations or applications were added by this marketing rollout.

Run `node --test scripts/markets.test.mjs` for route mapping checks. Test location
responses with country headers against the local `/api/geo` endpoint. No live
signup is needed to verify navigation or form options.
