import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// The vocabulary (src/lib/tracking.ts) and what the site actually emits must be
// the same set. A key emitted but not listed is an event the workspace never
// names; a key listed but not emitted is a tag that can only ever read zero.
// analytics-service seeds its EventTag rows from the same list, so a drift here
// is a drift in the staff's Website page.

const root = fileURLToPath(new URL('../', import.meta.url));

const source = await readFile(resolve(root, 'src/lib/tracking.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { TRACKED_EVENTS, TRACKED_KEYS } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

const CODE = new Set(['.ts', '.tsx']);
const LITERAL_ATTRIBUTE = /data-track(?:-view)?="([a-z0-9-]+)"/g;

async function sources(dir) {
  const out = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, item.name);
    if (item.isDirectory()) out.push(...(await sources(path)));
    else if (item.isFile() && CODE.has(extname(path)) && !path.endsWith('tracking.ts')) out.push(path);
  }
  return out;
}

const files = [];
for (const path of await sources(resolve(root, 'src'))) {
  files.push([path, await readFile(path, 'utf8')]);
}

test('nothing emits a key the vocabulary does not have', () => {
  for (const [path, text] of files) {
    for (const [, key] of text.matchAll(LITERAL_ATTRIBUTE)) {
      assert.ok(TRACKED_KEYS.includes(key), `${path}: data-track="${key}" is not in src/lib/tracking.ts`);
    }
  }
});

test('every key in the vocabulary is emitted somewhere', () => {
  // A key reaches the tracker as a string, whether it is written in the
  // attribute, passed to track(), or held in a table of nav links.
  const unused = TRACKED_KEYS.filter(
    (key) => !files.some(([, text]) => text.includes(`"${key}"`) || text.includes(`'${key}'`)),
  );
  assert.deepEqual(unused, [], `listed but never emitted: ${unused.join(', ')}`);
});

test('keys are unique, slug-shaped, and named', () => {
  assert.equal(new Set(TRACKED_KEYS).size, TRACKED_KEYS.length, 'duplicate key');
  for (const { key, name } of TRACKED_EVENTS) {
    assert.match(key, /^[a-z0-9]+(-[a-z0-9]+)*$/, `not a slug: ${key}`);
    assert.ok(name.trim().length > 2, `unnamed: ${key}`);
    assert.ok(key.length <= 80 && name.length <= 80, `too long for analytics-service: ${key}`);
  }
});
