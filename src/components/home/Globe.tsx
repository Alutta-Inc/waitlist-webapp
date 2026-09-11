"use client";

import { useEffect, useRef } from "react";
import land from "@/lib/globe-land.json";

/** A globe of the world's land, drawn on a sphere.
 *
 *  The land outlines are Natural Earth 1:110m (public domain), kept in
 *  lib/globe-land.json as longitude/latitude rings (see
 *  scripts/build-globe-land.mjs). Each frame projects them orthographically,
 *  the view of a sphere from far away, so only the facing hemisphere shows
 *  and the coasts curve toward the edge the way they do on a real globe. It
 *  turns slowly about its axis; with reduced motion it stands still, centred
 *  on Africa, where Alutta starts.
 *
 *  Land only: the dataset has no country borders. */

const RINGS = land as number[][][];
const SIZE = 200;
const R = 96;
const CX = SIZE / 2;
const CY = SIZE / 2;
const TILT = 12; // latitude of the view centre, degrees
const START_LON = 18; // Africa faces us first
const DEG = Math.PI / 180;

/** SVG path data for a list of rings at a given view centre. Runs of points
 *  on the facing hemisphere become sub-paths; a ring entirely in view closes. */
function project(rings: number[][][], lon0: number, lat0: number): string {
  const sinLat0 = Math.sin(lat0 * DEG);
  const cosLat0 = Math.cos(lat0 * DEG);
  const parts: string[] = [];
  for (const ring of rings) {
    let run: string[] = [];
    let allVisible = true;
    for (const [lon, lat] of ring) {
      const dl = (lon - lon0) * DEG;
      const sinLat = Math.sin(lat * DEG);
      const cosLat = Math.cos(lat * DEG);
      const cosC = sinLat0 * sinLat + cosLat0 * cosLat * Math.cos(dl);
      if (cosC <= 0) {
        allVisible = false;
        if (run.length > 1) parts.push("M" + run.join("L"));
        run = [];
        continue;
      }
      const x = CX + R * cosLat * Math.sin(dl);
      const y = CY - R * (cosLat0 * sinLat - sinLat0 * cosLat * Math.cos(dl));
      run.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    if (run.length > 1) parts.push("M" + run.join("L") + (allVisible ? "Z" : ""));
  }
  return parts.join("");
}

/** Meridians every 30° and parallels every 30°, as one path. */
function graticule(lon0: number, lat0: number): string {
  const lines: number[][][] = [];
  for (let m = -180; m < 180; m += 30) {
    const line: number[][] = [];
    for (let lat = -80; lat <= 80; lat += 5) line.push([m, lat]);
    lines.push(line);
  }
  for (let p = -60; p <= 60; p += 30) {
    const line: number[][] = [];
    for (let lon = -180; lon <= 180; lon += 5) line.push([lon, p]);
    lines.push(line);
  }
  return project(lines, lon0, lat0);
}

export default function Globe({ className }: { className?: string }) {
  const landRef = useRef<SVGPathElement>(null);
  const gridRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const landEl = landRef.current;
    const gridEl = gridRef.current;
    if (!landEl || !gridEl) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let start = 0;
    const draw = (lon: number) => {
      landEl.setAttribute("d", project(RINGS, lon, TILT));
      gridEl.setAttribute("d", graticule(lon, TILT));
    };
    const tick = (now: number) => {
      if (!start) start = now;
      // One full turn every 90 seconds, westward, like the real thing seen
      // from above the equator.
      draw(START_LON + ((now - start) / 1000) * 4);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (media.matches) draw(START_LON);
      else frame = requestAnimationFrame(tick);
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
    };
  }, []);

  return (
    <svg className={className} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="A globe, turning slowly, centred on Africa">
      <defs>
        <radialGradient id="globe-sea" cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor="#f3f8e2" />
          <stop offset=".65" stopColor="#dcebbf" />
          <stop offset="1" stopColor="#c6dba6" />
        </radialGradient>
        <radialGradient id="globe-shade" cx="35%" cy="30%" r="75%">
          <stop offset=".55" stopColor="#123f33" stopOpacity="0" />
          <stop offset="1" stopColor="#123f33" stopOpacity=".16" />
        </radialGradient>
        <clipPath id="globe-clip"><circle cx={CX} cy={CY} r={R} /></clipPath>
      </defs>
      <circle cx={CX} cy={CY} r={R} fill="url(#globe-sea)" />
      <g clipPath="url(#globe-clip)">
        <path ref={gridRef} d={graticule(START_LON, TILT)} fill="none" stroke="#95b081" strokeOpacity=".35" strokeWidth=".6" />
        <path ref={landRef} d={project(RINGS, START_LON, TILT)} fill="#6f9a5e" stroke="#4e7f47" strokeWidth=".7" strokeLinejoin="round" />
      </g>
      <circle cx={CX} cy={CY} r={R} fill="url(#globe-shade)" />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#86a16c" strokeWidth="1.2" />
    </svg>
  );
}
