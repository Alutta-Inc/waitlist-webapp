/** Where the product lives, as distinct from this site.
 *
 *  alutta.com is the company's website. The student product is a separate app
 *  on its own host, and the two must not be mistaken for each other: this site
 *  carries no manifest and installs nowhere, and every "open the app" link here
 *  crosses to that host rather than to a route of this one.
 *
 *  NAMED FOR THE STUDENT APP, not "the app". The older NEXT_PUBLIC_APP_URL was
 *  set to the workspace in at least one environment, and a sign-in link built
 *  from it sent a student to the staff tool's 404. A variable that says which
 *  app cannot be pointed at the wrong one by accident. */
export const STUDENT_APP_URL =
  process.env.NEXT_PUBLIC_STUDENT_APP_URL || "https://app.alutta.com";

export const STUDENT_SIGNIN_URL = `${STUDENT_APP_URL}/signin`;

export const SITE_URL = "https://alutta.com";
