// Turns public/images/world-land.svg (Natural Earth 1:110m land, public
// domain, equirectangular: x = 2(lon + 180), y = 2(85 - lat)) into the
// longitude/latitude rings the 404 page's globe projects onto a sphere.
//
//   node scripts/build-globe-land.mjs
//
// Writes src/lib/globe-land.json: an array of rings, each an array of
// [lon, lat] pairs rounded to a tenth of a degree. Rings with fewer than
// four points (specks at this scale) are dropped.
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile(new URL('../public/images/world-land.svg', import.meta.url), 'utf8');
const d = /<path[^>]*\sd="([^"]+)"/.exec(svg)?.[1];
if (!d) throw new Error('no path data found in world-land.svg');

const rings = [];
let ring = null;
for (const cmd of d.matchAll(/([MLZ])([^MLZ]*)/g)) {
  const [, op, args] = cmd;
  if (op === 'Z') { if (ring && ring.length >= 4) rings.push(ring); ring = null; continue; }
  const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if (op === 'M') { if (ring && ring.length >= 4) rings.push(ring); ring = []; }
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const lon = Math.round((nums[i] / 2 - 180) * 10) / 10;
    const lat = Math.round((85 - nums[i + 1] / 2) * 10) / 10;
    const last = ring[ring.length - 1];
    if (!last || last[0] !== lon || last[1] !== lat) ring.push([lon, lat]);
  }
}
if (ring && ring.length >= 4) rings.push(ring);

const out = JSON.stringify(rings);
await writeFile(new URL('../src/lib/globe-land.json', import.meta.url), out);
console.log(`globe-land.json: ${rings.length} rings, ${rings.reduce((n, r) => n + r.length, 0)} points, ${(out.length / 1024).toFixed(1)} KB`);
