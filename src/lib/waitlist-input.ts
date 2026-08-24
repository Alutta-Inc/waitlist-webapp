/** Input hygiene for the one public write path this site has.
 *
 *  The waitlist form is the only place an anonymous stranger can put text into
 *  Alutta's systems. What they type is stored in customer-service, shown to
 *  staff in the workspace, and interpolated into a confirmation email — three
 *  surfaces, none of which should ever have to wonder whether a name is a name.
 *  So the cleaning happens once, here, at the door.
 *
 *  The approach, in order of strength:
 *
 *   1. ALLOWLIST where an allowlist is possible. Country and destination are
 *      chosen from a fixed list, so the server checks the value IS one of that
 *      list rather than trying to decide whether the text is dangerous. Nothing
 *      a caller invents can survive it, and the ISO code is derived here rather
 *      than accepted from the client, so the name and the code can never
 *      disagree.
 *   2. REJECT, don't sanitise, everywhere else. A name containing a tag is not
 *      a name with a problem to be stripped out; it is not a name. Silently
 *      rewriting input hides an attack and mangles legitimate text; refusing it
 *      tells the truth and keeps what is stored identical to what was typed.
 *   3. CAP everything. Length limits on every field, and a size limit on the
 *      request body itself, so a payload cannot become a denial of service.
 *
 *  React escapes on render, so this is not about the marketing site's own DOM.
 *  It is about everything downstream that is not React. */

/** A field-level rejection. The message is safe to show a user. */
export class InvalidInput extends Error {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(message);
    this.name = "InvalidInput";
  }
}

/** Anything that could start a tag, an entity, or a script URL.
 *
 *  Deliberately blunt. A waitlist form has no legitimate use for angle
 *  brackets, backslashes, braces or a URL scheme, so there is no cost to
 *  refusing them and no clever parser to get wrong. */
const MARKUP = /[<>]/;
const ENCODED_MARKUP = /&#\d|&#x|&lt;|&gt;|%3c|%3e/i;
const SCHEME = /(?:javascript|vbscript|data|file)\s*:/i;
const HANDLER = /\bon[a-z]{3,}\s*=/i;
/** C0 and C1 control characters, plus the invisibles that hide text direction.
 *
 *  Written as code-point ranges rather than a regex literal on purpose: the
 *  escape sequences for this set are exactly the kind of thing that survives
 *  one copy and not the next, and a silently empty character class would let
 *  everything through while still looking correct. */
function hasControlChars(value: string): boolean {
  for (const ch of value) {
    const c = ch.codePointAt(0) as number;
    if (c < 0x20 || (c >= 0x7f && c <= 0x9f)) return true;   // C0 and C1
    if (c >= 0x200b && c <= 0x200f) return true;             // zero-width, marks
    if (c >= 0x202a && c <= 0x202e) return true;             // bidi overrides
    if (c >= 0x2066 && c <= 0x2069) return true;             // bidi isolates
  }
  return false;
}

function assertClean(field: string, value: string) {
  if (MARKUP.test(value) || ENCODED_MARKUP.test(value)) {
    throw new InvalidInput(field, "That field cannot contain < or >.");
  }
  if (SCHEME.test(value) || HANDLER.test(value)) {
    throw new InvalidInput(field, "That field cannot contain a script or a link.");
  }
  if (hasControlChars(value)) {
    throw new InvalidInput(field, "That field contains characters we cannot accept.");
  }
}

/** A free-text field: a string, trimmed, capped, and free of markup. */
export function text(
  value: unknown,
  field: string,
  max: number,
  opts: { required?: boolean; label?: string } = {},
): string {
  const label = opts.label ?? field;
  if (value === undefined || value === null || value === "") {
    if (opts.required) throw new InvalidInput(field, `${label} is required.`);
    return "";
  }
  // A JSON body can carry an array or an object where a string belongs, and
  // `String(x)` would happily turn either into something that looks fine.
  if (typeof value !== "string") {
    throw new InvalidInput(field, `${label} is not valid.`);
  }
  const trimmed = value.normalize("NFC").trim();
  if (opts.required && !trimmed) {
    throw new InvalidInput(field, `${label} is required.`);
  }
  if (trimmed.length > max) {
    throw new InvalidInput(field, `${label} is too long.`);
  }
  assertClean(field, trimmed);
  return trimmed;
}

/** A person's name. Letters, marks, spaces and the punctuation real names use. */
const NAME_OK = /^[\p{L}\p{M}][\p{L}\p{M}\s'’\-.]*$/u;

export function personName(value: unknown, field = "firstName"): string {
  const name = text(value, field, 80, { required: true, label: "Name" });
  if (!NAME_OK.test(name)) {
    throw new InvalidInput(field, "Please enter your name using letters only.");
  }
  return name;
}

/** An email address.
 *
 *  Not an attempt at RFC 5322 — a deliverable address is proven by the
 *  confirmation email, not by a regular expression. This rejects the shapes
 *  that are certainly wrong and the characters that are certainly hostile. */
const EMAIL_OK = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export function email(value: unknown, field = "email"): string {
  const raw = text(value, field, 254, { required: true, label: "Email" }).toLowerCase();
  if (!EMAIL_OK.test(raw)) {
    throw new InvalidInput(field, "Please enter a valid email address.");
  }
  const [local, domain] = raw.split("@");
  if (local.length > 64 || domain.length > 253 || domain.endsWith(".")) {
    throw new InvalidInput(field, "Please enter a valid email address.");
  }
  return raw;
}

export type Option = { code: string; name: string };

/** A value that must BE one of a fixed list.
 *
 *  Matched on the name, case-insensitively, and the canonical name and code are
 *  returned from the list rather than from the caller — so a client cannot pair
 *  "Nigeria" with the code for somewhere else, and cannot smuggle anything at
 *  all through a field that has only forty legal answers. */
export function fromList(
  value: unknown,
  list: readonly Option[],
  field: string,
  label: string,
): Option {
  const raw = text(value, field, 120, { required: true, label });
  const hit = list.find((o) => o.name.toLowerCase() === raw.toLowerCase());
  if (!hit) {
    throw new InvalidInput(field, `Please choose ${label.toLowerCase()} from the list.`);
  }
  return hit;
}

/** A machine token: analytics tags, sources, referral codes. */
export function token(
  value: unknown,
  field: string,
  max: number,
  pattern: RegExp,
): string {
  const raw = text(value, field, max);
  if (!raw) return "";
  if (!pattern.test(raw)) {
    throw new InvalidInput(field, "That value is not valid.");
  }
  return raw;
}

/** utm_*, source and program: the characters analytics tools actually emit. */
export const TAG = /^[A-Za-z0-9][A-Za-z0-9 _.\-+/&()]*$/;
/** A referral code we issued. Ours are alphanumeric; nothing else is one. */
export const REFERRAL = /^[A-Za-z0-9]{4,16}$/;

/** The largest body this route will read before parsing it.
 *
 *  A JSON parser will happily consume ten megabytes of nonsense and only then
 *  discover the name is too long, so the cap has to come first. */
export const MAX_BODY_BYTES = 8 * 1024;
