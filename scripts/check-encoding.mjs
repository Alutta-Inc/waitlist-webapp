import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.json', '.svg', '.html', '.md', '.txt', '.vtt']);
// Common signatures of UTF-8 bytes mistakenly decoded as Windows-1252/Latin-1.
const corruption = /\uFFFD|\u00e2[\u0080-\u00bf\u0152\u0153\u20ac\u2018-\u2026\u2122]|\u00f0[\u009f\u0178]|\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]/u;

export function validateEncoding(bytes) {
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { return 'File is not valid UTF-8.'; }
  const match = corruption.exec(text);
  if (match) return `Possible corrupted text on line ${text.slice(0, match.index).split('\n').length}. Restore the intended characters and save as UTF-8.`;
  return null;
}

async function scan(directory) {
  const failures = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name);
    if (item.isDirectory()) failures.push(...await scan(path));
    else if (item.isFile() && extensions.has(extname(path))) {
      const issue = validateEncoding(await readFile(path));
      if (issue) failures.push(`${path}: ${issue}`);
    }
  }
  return failures;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const failures = (await Promise.all(['src', 'public'].map(path => scan(resolve(root, path))))).flat();
  if (failures.length) {
    console.error(`Encoding check failed:\n${failures.join('\n')}`);
    process.exitCode = 1;
  } else console.log('Encoding check passed: source and public text files are valid UTF-8 with no known corruption.');
}
