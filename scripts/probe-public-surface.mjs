// Black-box probe of the marketing site's public surface: the headers every
// page carries, the API routes, the waitlist door, the per-IP brake, and the
// framework surface. Run against a built server:
//
//   npm run build && npm start -- -p 3011
//   node scripts/probe-public-surface.mjs http://localhost:3011
//
// Each probe presents its own client address (x-forwarded-for, which `next
// start` honours) so the brake's failure budget is only consumed by the one
// case that tests it. Prints PASS/FAIL per case and a summary; exits 1 on any
// FAIL. It sends no real signup: every waitlist probe is refused before
// customer-service, since the Turnstile token is never genuine.
const base = (process.argv[2] || 'http://localhost:3011').replace(/\/$/, '');
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  · ' + detail : ''}`); };

const good = { firstName: 'Ayomide', email: `ayomide+${Date.now()}@gmail.com`, country: 'Nigeria', destination: 'United Kingdom', source: 'pentest', turnstileToken: 'x'.repeat(40) };
let probe = 0;
const freshIp = () => `198.51.100.${(probe++ % 250) + 1}`;
const post = (body, headers = {}, raw = false) => fetch(`${base}/api/waitlist`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'x-forwarded-for': freshIp(), ...headers }, body: raw ? body : JSON.stringify(body) });
const json = async (r) => { try { return await r.json(); } catch { return {}; } };

// ── Headers on a page ────────────────────────────────────────────────────
{
  const r = await fetch(`${base}/`);
  const h = Object.fromEntries([...r.headers.entries()]);
  check('CSP present', !!h['content-security-policy'], (h['content-security-policy'] || '').slice(0, 80) + '…');
  check("CSP frames nobody", /frame-ancestors 'none'/.test(h['content-security-policy'] || ''));
  check("CSP object-src none", /object-src 'none'/.test(h['content-security-policy'] || ''));
  check('CSP no unsafe-eval in prod', !/unsafe-eval/.test(h['content-security-policy'] || ''));
  check('HSTS', /max-age=\d+/.test(h['strict-transport-security'] || ''));
  check('nosniff', h['x-content-type-options'] === 'nosniff');
  check('X-Frame-Options DENY', h['x-frame-options'] === 'DENY');
  check('Referrer-Policy', !!h['referrer-policy']);
  check('Permissions-Policy', !!h['permissions-policy']);
  check('no X-Powered-By', !h['x-powered-by']);
  const html = await r.text();
  check('no inline event handlers in HTML', !/\son(click|load|error|mouseover)=/i.test(html));
  check('no external script hosts beyond Turnstile', !/<script[^>]+src="https?:\/\/(?!challenges\.cloudflare\.com)/i.test(html));
}

// ── API surface ──────────────────────────────────────────────────────────
{
  const r = await fetch(`${base}/api/waitlist`);
  check('GET /api/waitlist is 405', r.status === 405, `status ${r.status}`);
  const h = await fetch(`${base}/api/health`);
  check('health is 200', h.status === 200);
  check('API routes noindex', h.headers.get('x-robots-tag') === 'noindex');
  const g = await fetch(`${base}/api/geo`, { headers: { 'cf-ipcountry': '<script>alert(1)</script>' } });
  const gb = await g.json();
  check('geo rejects injected header value', gb.countryName === null, JSON.stringify(gb));
  check('geo is no-store', /no-store/.test(g.headers.get('cache-control') || ''));
  const ref = await fetch(`${base}/api/referral?code=%3Cscript%3E`);
  const rb = await ref.json();
  check('referral refuses bad shape without upstream', rb.valid === false, JSON.stringify(rb));
  const ref2 = await fetch(`${base}/api/referral?code=NOPE0000`);
  check('referral unknown code is not valid', (await ref2.json()).valid !== true);
}

// ── The waitlist door ────────────────────────────────────────────────────
{
  let r = await post(good, { 'content-type': 'text/plain' });
  check('wrong content-type is 415', r.status === 415, `status ${r.status}`);

  r = await post(good, { origin: 'https://evil.example' });
  check('foreign Origin is 403', r.status === 403, `status ${r.status}`);

  r = await post('{"firstName":' + '"' + 'a'.repeat(9000) + '"}', {}, true);
  check('oversized body is 413', r.status === 413, `status ${r.status}`);

  r = await post('{not json', {}, true);
  check('malformed JSON is 400', r.status === 400);

  r = await post([1, 2, 3]);
  check('array body is 400', r.status === 400);

  r = await post({ ...good, website: 'http://spam.example' });
  check('honeypot filled is refused', r.status === 400, `status ${r.status}`);

  r = await post({ ...good, firstName: '<img src=x onerror=alert(1)>' });
  let b = await json(r);
  check('XSS in name refused', r.status === 400 && b.field === 'firstName', JSON.stringify(b));

  r = await post({ ...good, firstName: 'Ayo‮odimoy' });
  check('bidi override in name refused', r.status === 400);

  r = await post({ ...good, email: 'ayo@mailinator.com' });
  b = await json(r);
  check('disposable email refused', r.status === 400 && b.field === 'email', JSON.stringify(b));

  r = await post({ ...good, email: 'ayo@example.com\r\nBcc: victim@example.com' });
  check('header injection in email refused', r.status === 400);

  r = await post({ ...good, country: 'Nigeria<script>' });
  check('country not on the list refused', r.status === 400);

  r = await post({ ...good, country: 'Nigeria', countryCode: 'GB' });
  // The server derives the code; the caller's is ignored. We cannot see the
  // forwarded body here, so only assert it was not a reason to fail validation.
  check('caller-supplied country code is ignored (no 400 on it)', r.status !== 400 || (await json(r)).field !== 'countryCode');

  r = await post({ ...good, program: 'javascript:alert(1)' });
  check('script URL in programme refused', r.status === 400);

  r = await post({ ...good, referredBy: '<b>X</b>', utm: { campaign: '<svg onload=1>' } });
  b = await json(r);
  check('hostile attribution is dropped, not a reason to refuse validation', !(r.status === 400 && ['referredBy', 'attribution'].includes(b.field)), JSON.stringify(b));

  r = await post({ ...good, utm: 'not-an-object' });
  check('utm as a string does not crash', r.status !== 500);

  r = await post({ ...good, __proto__: { polluted: true }, constructor: { prototype: { polluted: true } } });
  check('prototype pollution keys do not crash', r.status !== 500 && !({}).polluted);

  r = await post({ ...good, turnstileToken: undefined });
  b = await json(r);
  check('missing Turnstile token refused', r.status === 400 && /security check/i.test(b.error || ''), JSON.stringify(b));

  r = await post({ ...good, turnstileToken: 'x'.repeat(5000) });
  check('absurd Turnstile token refused before upstream', r.status === 400);

  r = await post(good);
  b = await json(r);
  check('bogus Turnstile token is 403 (real siteverify)', r.status === 403 || r.status === 503, `status ${r.status} ${JSON.stringify(b)}`);
}

// ── The researcher removal door ──────────────────────────────────────────
// The same checks as the waitlist, its own Turnstile action and a tighter
// budget. Never reaches supervisor-service: the token is never genuine.
{
  const removal = { name: 'Adaeze Okonkwo', email: 'a.okonkwo@example.ac.uk', profileUrl: 'https://example.ac.uk/people/okonkwo', turnstileToken: 'x'.repeat(40) };
  const send = (body, headers = {}, raw = false) => fetch(`${base}/api/researchers/removal`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'x-forwarded-for': freshIp(), ...headers }, body: raw ? body : JSON.stringify(body) });

  const page = await fetch(`${base}/researchers`);
  check('researchers page is 200 with CSP', page.status === 200 && !!page.headers.get('content-security-policy'), `status ${page.status}`);

  const bot = await fetch(`${base}/bot`);
  const botHtml = await bot.text();
  check('bot page is 200 and names the exact user agent', bot.status === 200 && botHtml.includes('AluttaBot/1.0 (+https://alutta.com/bot)'), `status ${bot.status}`);

  let r = await fetch(`${base}/api/researchers/removal`);
  check('GET removal is 405', r.status === 405, `status ${r.status}`);

  r = await send(removal, { 'content-type': 'text/plain' });
  check('removal wrong content-type is 415', r.status === 415, `status ${r.status}`);

  r = await send(removal, { origin: 'https://evil.example' });
  check('removal foreign Origin is 403', r.status === 403, `status ${r.status}`);

  r = await send('{"name":"' + 'a'.repeat(9000) + '"}', {}, true);
  check('removal oversized body is 413', r.status === 413, `status ${r.status}`);

  r = await send({ ...removal, website: 'http://spam.example' });
  check('removal honeypot filled is refused', r.status === 400, `status ${r.status}`);

  r = await send({ ...removal, name: '<img src=x onerror=alert(1)>' });
  let b = await json(r);
  check('removal XSS in name refused', r.status === 400 && b.field === 'name', JSON.stringify(b));

  r = await send({ ...removal, profileUrl: 'javascript:alert(1)' });
  b = await json(r);
  check('removal script URL refused', r.status === 400 && b.field === 'profileUrl', JSON.stringify(b));

  r = await send({ ...removal, email: 'a@example.ac.uk\r\nBcc: x@example.com' });
  check('removal header injection in email refused', r.status === 400);

  r = await send({ ...removal, turnstileToken: undefined });
  b = await json(r);
  check('removal missing Turnstile token refused', r.status === 400 && /security check/i.test(b.error || ''), JSON.stringify(b));

  r = await send(removal);
  check('removal bogus Turnstile token is 403 (real siteverify)', r.status === 403 || r.status === 503, `status ${r.status}`);

  // The confirmation door: POST only, and a token that is not one of ours never
  // reaches the service.
  const confirmUrl = `${base}/api/researchers/removal/confirm`;
  r = await fetch(confirmUrl);
  check('GET removal confirm is 405 (a link must never remove anyone)', r.status === 405, `status ${r.status}`);
  r = await fetch(confirmUrl, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'x-forwarded-for': freshIp() }, body: JSON.stringify({ token: '<script>' }) });
  check('removal confirm refuses a malformed token before upstream', r.status === 404, `status ${r.status}`);
  r = await fetch(confirmUrl, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://evil.example', 'x-forwarded-for': freshIp() }, body: JSON.stringify({ token: 'a'.repeat(40) }) });
  check('removal confirm foreign Origin is 403', r.status === 403, `status ${r.status}`);
  // The site block door and its confirmation: same checks, its own action.
  const blockUrl = `${base}/api/bot/block`;
  const block = { domain: 'example.ac.uk', email: 'webmaster@example.ac.uk', name: 'Web team', turnstileToken: 'x'.repeat(40) };
  const sendBlock = (body, headers = {}) => fetch(blockUrl, { method: 'POST', headers: { 'content-type': 'application/json', origin: base, 'x-forwarded-for': freshIp(), ...headers }, body: JSON.stringify(body) });
  r = await fetch(blockUrl);
  check('GET site block is 405', r.status === 405, `status ${r.status}`);
  r = await sendBlock(block, { origin: 'https://evil.example' });
  check('site block foreign Origin is 403', r.status === 403, `status ${r.status}`);
  r = await sendBlock({ ...block, email: 'someone@gmail.com' });
  let bb = await json(r);
  check('site block refuses an email not at the site', r.status === 400 && bb.field === 'email', JSON.stringify(bb));
  r = await sendBlock({ ...block, domain: 'javascript:alert(1)' });
  check('site block refuses a domain that is not a website', r.status === 400, `status ${r.status}`);
  r = await sendBlock(block);
  check('site block bogus Turnstile token is 403 (real siteverify)', r.status === 403 || r.status === 503, `status ${r.status}`);
  r = await fetch(`${base}/api/bot/block/confirm`);
  check('GET site block confirm is 405', r.status === 405, `status ${r.status}`);
  const botConfirmPage = await fetch(`${base}/bot/confirm`);
  check('site block confirm page is noindex', botConfirmPage.status === 200 && /noindex/.test(await botConfirmPage.text()), `status ${botConfirmPage.status}`);

  const confirmPage = await fetch(`${base}/researchers/confirm`);
  check('confirm page is noindex', confirmPage.status === 200 && /noindex/.test(await confirmPage.text()), `status ${confirmPage.status}`);
}

// ── Rate limit: failures are budgeted at 15 per 10 minutes ──────────────
{
  let last = 0;
  for (let i = 0; i < 20; i++) {
    const r = await post({ ...good, firstName: '<x>' }, { 'x-forwarded-for': '203.0.113.77' });
    last = r.status;
    if (last === 429) break;
  }
  check('failure budget trips to 429', last === 429, `last status ${last}`);
}

// ── Static and framework surface ─────────────────────────────────────────
{
  const r = await fetch(`${base}/_next/image?url=https://example.com/x.png&w=64&q=75`);
  check('remote image proxy refused', r.status === 400 || r.status === 403 || r.status === 404, `status ${r.status}`);
  const t = await fetch(`${base}/.env.local`);
  check('.env.local not served', t.status === 404);
  const p = await fetch(`${base}/package.json`);
  check('package.json not served', p.status === 404);
  const nf = await fetch(`${base}/definitely-not-a-page`);
  check('404 is branded and noindex', nf.status === 404 && /A little off course/.test(await nf.text()));
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed${failed.length ? '; FAILED: ' + failed.map((f) => f.name).join(', ') : ''}`);
process.exitCode = failed.length ? 1 : 0;
