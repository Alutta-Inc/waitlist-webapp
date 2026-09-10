"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { GraduationCap, Sparkles, Globe2, Pause, Play, RotateCcw } from "lucide-react";

export function ScrollProfile({children}:{children:ReactNode}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const media=matchMedia("(prefers-reduced-motion: reduce)"); let frame=0;
  const update=()=>{frame=0;const el=ref.current;if(!el)return;const rect=el.getBoundingClientRect();const t=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));el.style.setProperty("--profile-angle",`${media.matches?0:7-t*16}deg`);};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);}; update();addEventListener("scroll",schedule,{passive:true});addEventListener("resize",schedule);media.addEventListener("change",schedule);
  return()=>{cancelAnimationFrame(frame);removeEventListener("scroll",schedule);removeEventListener("resize",schedule);media.removeEventListener("change",schedule);};
 },[]);
 return <div ref={ref} className="ng-profile-preview ng-profile-motion">{children}</div>;
}
export function ProgrammeRibbon(){return <div className="ng-programme-strip"><span className="ng-strip-intro">YOUR NEXT BIG THING</span><a href="#how-it-works"><GraduationCap/>Master’s programmes<span>Deepen your expertise</span></a><a href="#how-it-works"><Sparkles/>PhD opportunities<span>Ask bigger questions</span></a><a href="#global-journey"><Globe2/>Nigeria &amp; beyond<span>Expand your horizons</span></a></div>;}
const origin={x:366.7584,y:156.9512};
// Coordinates share the land map's equirectangular projection: x = 2(lon + 180), y = 2(85 - lat).
const routes=[
 {id:"us",city:"New York",x:211.988,y:88.5744,cx:268,cy:20},
 {id:"uk",city:"London",x:359.7444,y:66.9852,cx:324,cy:91},
 {id:"ca",city:"Vancouver",x:113.7586,y:71.4346,cx:211,cy:-18},
 {id:"cn",city:"Beijing",x:592.8148,y:90.1916,cx:485,cy:3},
 {id:"au",city:"Sydney",x:662.4186,y:237.7376,cx:561,cy:132},
];
export function NigeriaFlightMap(){
 const elapsed=useRef(0);const ref=useRef<HTMLDivElement>(null);const [paused,setPaused]=useState(false);const [replay,setReplay]=useState(0);
 useEffect(()=>{const el=ref.current;if(!el)return;const media=matchMedia("(prefers-reduced-motion: reduce)");let frame=0,last=0,time=elapsed.current,visible=false;
 const draw=(t:number)=>{routes.forEach(r=>{const plane=el.querySelector<SVGGElement>(`[data-plane="${r.id}"]`);const trail=el.querySelector<SVGPathElement>(`[data-trail="${r.id}"]`);const u=1-t;const x=u*u*origin.x+2*u*t*r.cx+t*t*r.x,y=u*u*origin.y+2*u*t*r.cy+t*t*r.y;const angle=Math.atan2(2*u*(r.cy-origin.y)+2*t*(r.y-r.cy),2*u*(r.cx-origin.x)+2*t*(r.x-r.cx))*180/Math.PI;if(plane)plane.setAttribute("transform",`translate(${x} ${y}) rotate(${angle})`);if(trail)trail.style.strokeDashoffset=String(1-t);});};
 const tick=(now:number)=>{if(last)time+=Math.min(now-last,50);last=now;elapsed.current=time;draw(Math.min(1,(time%9500)/7500));frame=requestAnimationFrame(tick);};
 const sync=()=>{cancelAnimationFrame(frame);last=0;if(media.matches){draw(1);return;}if(visible&&!paused)frame=requestAnimationFrame(tick);};
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.15});observer.observe(el);draw(media.matches?1:Math.min(1,(time%9500)/7500));media.addEventListener("change",sync);
 return()=>{observer.disconnect();cancelAnimationFrame(frame);media.removeEventListener("change",sync);};
 },[paused,replay]);
 return <div ref={ref} className="ng-flight-map"><div className="ng-map-heading"><span><i/> ONE PROFILE. A WORLD OF POSSIBILITY.</span><div><button type="button" onClick={()=>setPaused(!paused)} aria-label={paused?"Play flights":"Pause flights"}>{paused?<Play size={16}/>:<Pause size={16}/>}</button><button type="button" onClick={()=>{elapsed.current=0;setReplay(replay+1);setPaused(false);}} aria-label="Replay flights"><RotateCcw size={16}/></button></div></div>
 <svg viewBox="75 0 625 300" role="img" aria-label="Animated routes from Lagos, Nigeria to New York in the United States, London in the United Kingdom, Vancouver in Canada, Beijing in China, and Sydney in Australia"><defs><radialGradient id="ng-map-glow"><stop stopColor="#a3cd75" stopOpacity=".2"/><stop offset="1" stopColor="#a3cd75" stopOpacity="0"/></radialGradient></defs><ellipse cx="385" cy="150" rx="280" ry="170" fill="url(#ng-map-glow)"/><image href="/images/world-land.svg" width="720" height="330" opacity=".75"/>
 {routes.map(r=><g key={r.id}><path d={`M${origin.x} ${origin.y} Q${r.cx} ${r.cy} ${r.x} ${r.y}`} fill="none" stroke="#c5dfb2" strokeOpacity=".22" strokeWidth=".7" strokeDasharray="2 6"/><path data-trail={r.id} d={`M${origin.x} ${origin.y} Q${r.cx} ${r.cy} ${r.x} ${r.y}`} pathLength="1" strokeDasharray="1" strokeDashoffset="1" fill="none" stroke="#deedb4" strokeOpacity=".65" strokeWidth="1"/><circle cx={r.x} cy={r.y} r="3" fill="#e5f5b2"/><text x={r.x} y={r.y+(r.id==="ca"?-14:21)} textAnchor={r.id==="ca"?"start":"middle"} fill="#f4f9ec" fontSize="12">{r.city}</text><g data-plane={r.id} transform={`translate(${origin.x} ${origin.y})`}><path transform="scale(.55)" d="M13 0 L3 -2 L-4 -11 L-7 -11 L-4 -2 L-9 -2 L-12 -5 L-14 -5 L-12 0 L-14 5 L-12 5 L-9 2 L-4 2 L-7 11 L-4 11 L3 2 Z" fill="#f0ffb5" stroke="#143f2f" strokeWidth=".7"/></g></g>)}
 <circle cx={origin.x} cy={origin.y} r="12" fill="#dbedaa" opacity=".15"/><circle cx={origin.x} cy={origin.y} r="5" fill="#efffba"/><text x={origin.x} y={origin.y+28} textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Lagos</text><text x={origin.x} y={origin.y+44} textAnchor="middle" fill="#b4cbbd" fontSize="10" letterSpacing="2">NIGERIA</text></svg>
 </div>;
}
