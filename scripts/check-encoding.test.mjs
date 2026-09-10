import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEncoding } from './check-encoding.mjs';

test('accepts multilingual text, punctuation, and symbols', () => {
  assert.equal(validateEncoding(Buffer.from('Fran\u00e7ais, Vi\u1ec7t Nam, \u4e2d\u6587, \u2019 \u2733 \u2726 \ud83c\udf89')), null);
});
test('rejects invalid UTF-8 bytes', () => {
  assert.match(validateEncoding(Buffer.from([0xc3, 0x28])), /not valid UTF-8/);
});
test('rejects the corrupted star and common mojibake', () => {
  for (const text of ['\u00e2\u0153\u00b3', '\u00e2\u0153\u00a6', '\u00e2\u20ac\u2122', '\u00f0\u0178\u017d\u2030', '\ufffd']) {
    assert.match(validateEncoding(Buffer.from(text)), /corrupted text/);
  }
});
