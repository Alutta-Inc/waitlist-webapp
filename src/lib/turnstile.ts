/** Cloudflare Turnstile, as this site uses it.
 *
 *  One place for the values the widget and the server-side verification must
 *  agree on. A route file may only export handlers, so the constant lives
 *  here and both sides import it. */

/** The action this form registers with Turnstile. The widget renders with it
 *  and siteverify echoes it back, so a token solved on some other Alutta
 *  widget (or on a copy of ours) cannot be replayed into the waitlist door. */
export const TURNSTILE_ACTION = "waitlist";

/** The widget script, loaded on demand by the form and allowed by the CSP. */
export const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
