import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../src/lib/markets.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { marketForPath, marketPath } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('market is explicit in the URL, not inferred from similar names', () => {
 assert.equal(marketForPath('/'), 'global');
 assert.equal(marketForPath('/ng'), 'ng');
 assert.equal(marketForPath('/ng/waitlist'), 'ng');
 assert.equal(marketForPath('/nguyen'), 'global');
});
test('equivalent signup pages are preserved when switching', () => {
 assert.equal(marketPath('/waitlist', 'ng'), '/ng/waitlist');
 assert.equal(marketPath('/ng/waitlist', 'global'), '/waitlist');
});
test('shared pages fall back to Nigeria home without broken local routes', () => {
 for(const route of ['/terms', '/privacy', '/careers']) assert.equal(marketPath(route, 'ng'), '/ng');
 assert.equal(marketPath('/ng', 'global'), '/');
});
