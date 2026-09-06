/** Where the product lives, as distinct from this site.
 *
 *  alutta.com is the company's website. The student product is a separate app
 *  on its own host, and the two must not be mistaken for each other: this site
 *  carries no manifest and installs nowhere, and every "open the app" link here
 *  crosses to that host rather than to a route of this one. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.alutta.com";

export const SITE_URL = "https://alutta.com";
