import { checkDoor } from "@/lib/confirm-door";

// Is a site block link still good? Called when /bot/confirm opens, so the page
// can say "expired" or "already done", and name the website, at once.
// Read-only: it changes nothing, which is why it is safe on arrival
// (lib/confirm-door.ts).
const door = checkDoor({
  door: "site-block",
  upstreamPath: "/v1/supervisors/site-block/check/",
  extra: { domain: "example.ac.uk" },
  label: "site block check",
});

export const POST = door.POST;
export const GET = door.GET;
