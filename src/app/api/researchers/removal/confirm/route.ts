import { confirmDoor } from "@/lib/confirm-door";

// A researcher confirming the removal they asked for. The email's link opens
// /researchers/confirm with the token in the fragment, and the page posts it
// here only when the researcher presses the button (lib/confirm-door.ts has the
// rules). supervisor-service answers {removed: true}, expired or not found.
const door = confirmDoor({
  upstreamPath: "/v1/supervisors/removal/confirm/",
  sample: { removed: true },
  label: "removal confirm",
});

export const POST = door.POST;
export const GET = door.GET;
