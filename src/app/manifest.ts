import type { MetadataRoute } from "next";

// alutta.com is a website, not an app, and must not be installable. The old
// build shipped a `display: standalone` manifest, so some visitors have an
// "Alutta" app installed that opens this site in its own window. Browsers
// re-read a site's manifest when an installed app launches, so this one
// exists to UNDO that: `display: browser` tells them the site opens in a
// normal tab, and a site whose manifest says `browser` never qualifies for an
// install prompt. Do not set standalone, minimal-ui or fullscreen here.
// The student product at app.alutta.com is the thing that installs.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alutta",
    short_name: "Alutta",
    description: "Your study abroad journey, simplified.",
    start_url: "/",
    display: "browser",
    background_color: "#FFFFEB",
    theme_color: "#029b47",
    icons: [{ src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  };
}
