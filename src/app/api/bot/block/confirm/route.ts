import { confirmDoor } from "@/lib/confirm-door";

// A university web team confirming that AluttaBot should stop visiting their
// site. The email's link opens /bot/confirm with the token in the fragment, and
// the page posts it here only when they press the button (lib/confirm-door.ts
// has the rules). supervisor-service answers {blocked: true, domain, schools},
// expired or not found.
const door = confirmDoor({
  upstreamPath: "/v1/supervisors/site-block/confirm/",
  sample: { blocked: true, domain: "example.ac.uk", schools: ["Example University"] },
  label: "site block confirm",
});

export const POST = door.POST;
export const GET = door.GET;
