import { checkDoor } from "@/lib/confirm-door";

// Is a removal link still good? Called when /researchers/confirm opens, so the
// page can say "expired" or "already done" at once. Read-only: it changes
// nothing, which is why it is safe on arrival (lib/confirm-door.ts).
const door = checkDoor({
  door: "removal",
  upstreamPath: "/v1/supervisors/removal/check/",
  label: "removal check",
});

export const POST = door.POST;
export const GET = door.GET;
