// The waitlist door's input rules, exercised directly. `lib/waitlist-input.ts`
// is plain TypeScript with no React or Next imports, so it is transpiled in
// memory the same way markets.test.mjs does it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/waitlist-input.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const lib = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const { InvalidInput, personName, email, fromList, optional, text, assertDeliverableDomain, honeypotTripped, HONEYPOT_FIELD, REFERRAL } = lib;

const refuses = (fn, field) => {
  assert.throws(fn, (e) => e instanceof InvalidInput && (!field || e.field === field));
};

test('names: any script passes, markup and scripts do not', () => {
  assert.equal(personName('Adéọlá'), 'Adéọlá');
  assert.equal(personName("  O'Neil-Ngozi "), "O'Neil-Ngozi");
  refuses(() => personName('<b>Ayo</b>'), 'firstName');
  refuses(() => personName('Ayo onload=alert(1)'), 'firstName');
  refuses(() => personName('javascript:alert(1)'), 'firstName');
  refuses(() => personName('Ayo‮'), 'firstName');
  refuses(() => personName('Ayo123'), 'firstName');
  refuses(() => personName(''), 'firstName');
  refuses(() => personName(['Ayo']), 'firstName');
  refuses(() => personName('A'.repeat(81)), 'firstName');
});

test('email: lower-cased, shape-checked, throw-away domains refused', () => {
  assert.equal(email('Ayo@Example.COM'), 'ayo@example.com');
  refuses(() => email('not-an-email'), 'email');
  refuses(() => email('ayo@example'), 'email');
  refuses(() => email('ayo@<script>.com'), 'email');
  refuses(() => email('"ayo"@example.com'), 'email');
  assertDeliverableDomain('ayo@gmail.com');
  assertDeliverableDomain('ayo@unilag.edu.ng');
  refuses(() => assertDeliverableDomain('ayo@mailinator.com'), 'email');
  refuses(() => assertDeliverableDomain('ayo@sub.mailinator.com'), 'email');
  refuses(() => assertDeliverableDomain('ayo@yopmail.fr'), 'email');
  // A real domain that merely contains a listed one is fine.
  assertDeliverableDomain('ayo@notmailinator.com');
});

test('list fields: the value must BE one of the list, and the code comes from us', () => {
  const list = [{ code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }];
  assert.deepEqual(fromList('nigeria', list, 'country', 'Your country'), { code: 'NG', name: 'Nigeria' });
  refuses(() => fromList('Wakanda', list, 'country', 'Your country'), 'country');
  refuses(() => fromList('<img src=x>', list, 'country', 'Your country'), 'country');
});

test('attribution is dropped, never refused', () => {
  assert.equal(optional('ABCD1234', 16, REFERRAL), 'ABCD1234');
  assert.equal(optional('<script>', 16, REFERRAL), '');
  assert.equal(optional('too-long-for-a-referral-code', 16, REFERRAL), '');
  assert.equal(optional({ a: 1 }, 16), '');
  assert.equal(optional('spring|2026,ng', 120), 'spring|2026,ng');
});

test('free text: capped and markup-free', () => {
  assert.equal(text("Master's in Computer Science", 'program', 120), "Master's in Computer Science");
  refuses(() => text('x'.repeat(121), 'program', 120), 'program');
  refuses(() => text('&lt;b&gt;', 'program', 120), 'program');
  refuses(() => text('%3Cscript%3E', 'program', 120), 'program');
});

test('honeypot: absent or empty passes, anything else trips', () => {
  assert.equal(honeypotTripped({}), false);
  assert.equal(honeypotTripped({ [HONEYPOT_FIELD]: '' }), false);
  assert.equal(honeypotTripped({ [HONEYPOT_FIELD]: '   ' }), false);
  assert.equal(honeypotTripped({ [HONEYPOT_FIELD]: 'https://spam.example' }), true);
  assert.equal(honeypotTripped({ [HONEYPOT_FIELD]: 0 }), true);
});
