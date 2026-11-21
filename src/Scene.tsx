import React, { useEffect, useRef, useState } from 'react';
import './scene.css';

export function Emblem({className = '', alt = 'Amrit Astro Technical emblem', ...props}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (!failed) return <img {...props} alt={alt} className={className} src="/emblem.png" onError={() => setFailed(true)} />;
  return <svg className={className} style={props.style} width={props.width} height={props.height} viewBox="0 0 100 90" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={!alt} fill="currentColor" color="#e6be7a">
    {Array.from({length: 21}, (_, i) => <path key={i} d="M48 12 50 0 52 12Z" transform={`rotate(${-105 + i * 10.5} 50 48)`}/>)}
    <path d="M20 64a34 34 0 1 1 60 0M24 61a29.5 29.5 0 1 1 52 0" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M36 55V43h6v15zm10 8V35h6v28zm9-7V29h-3l7-9 6 9h-3v23zM49 84C43 68 33 67 30 53c14 6 23 13 19 31zm3-1c0-17 10-22 18-29-1 14-5 22-18 29zm-5 2C32 74 23 84 11 68c18-2 27 2 36 17zm7 0c9-15 21-17 36-18-10 17-23 9-36 18z"/>
  </svg>;
}

// Fixed sky coordinates keep the chart and figure aligned with the photographed ridge.
const points = [[896,223],[949,168],[1023,205],[1115,142],[1194,184],[1280,112],[1395,132]];
const orbitMarks = Array.from({length: 120}, (_, i) => i);
const sparkles = [[1290,147,8],[1478,94,6],[1617,114,12],[1764,258,8],[1837,103,6],[1245,397,7],[1097,252,5],[1126,73,5],[510,165,4],[866,105,5],[1363,331,8],[1891,357,5],[1530,450,6]];
function Star({x,y,r}:{x:number;y:number;r:number}) {
  return <g transform={`translate(${x} ${y})`}><circle r={r*2.4} fill="url(#aa-star)"/><path d={`M0 ${-r} Q1 -1 ${r} 0 Q1 1 0 ${r} Q-1 1 ${-r} 0 Q-1 -1 0 ${-r}`} fill="#ffe3a1"/></g>;
}

export default function Scene() {
  const shell = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const surface = shell.current, hero = surface?.parentElement;
    if (!hero || !surface) return;
    const eligible = window.matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)');
    let frame = 0;
    const move = (e: PointerEvent) => {
      if (!eligible.matches) return;
      const bounds = hero.getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width - .5;
      const y = (e.clientY - bounds.top) / bounds.height - .5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        surface.style.setProperty('--sky-x', `${x * 7}px`);
        surface.style.setProperty('--sky-y', `${y * 5}px`);
      });
    };
    const reset = () => { cancelAnimationFrame(frame);surface.style.setProperty('--sky-x','0px');surface.style.setProperty('--sky-y','0px'); };
    hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', reset);
    return () => { cancelAnimationFrame(frame);hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',reset); };
  }, []);
  return <div className="aat-scene" ref={shell} aria-hidden="true">
    <svg className="aat-panorama" viewBox="0 0 1983 793" preserveAspectRatio="xMaxYMid slice">
      <defs>
        <radialGradient id="aa-star"><stop stopColor="#ffe8ae" stopOpacity=".85"/><stop offset=".19" stopColor="#eac17d" stopOpacity=".5"/><stop offset="1" stopColor="#edaf50" stopOpacity="0"/></radialGradient>
        <radialGradient id="aa-aura"><stop stopColor="#ecb567" stopOpacity="0"/><stop offset=".84" stopColor="#e5ae66" stopOpacity=".018"/><stop offset=".965" stopColor="#e5ae66" stopOpacity=".08"/><stop offset="1" stopColor="#e5ae66" stopOpacity="0"/></radialGradient>
        <linearGradient id="aa-ring" x1="0" y1="0" x2=".8" y2="1" gradientUnits="objectBoundingBox"><stop stopColor="#bd8644" stopOpacity=".3"/><stop offset=".42" stopColor="#f7d59d"/><stop offset="1" stopColor="#ac803d" stopOpacity=".27"/></linearGradient>
        <linearGradient id="aa-shade"><stop stopColor="#070b16" stopOpacity=".75"/><stop offset=".38" stopColor="#070b16" stopOpacity=".28"/><stop offset=".72" stopColor="#070b16" stopOpacity="0"/></linearGradient>
      </defs>
      <image href="/dusk.jpg" width="1983" height="793"/>
      <rect width="1983" height="793" fill="url(#aa-shade)"/>
      <g className="aat-sky-layer">
        <g fill="none" stroke="#e8c893" strokeWidth=".9" opacity=".36"><polyline points={points.map(p=>p.join(',')).join(' ')}/><path d="m1395 132 62-71 88 18 43-46M1778 73l49 36 43-21 68 50"/></g>
        {points.map(([x,y])=><circle key={x} cx={x} cy={y} r="2.5" fill="#dfc591"/>)}
        <g transform="translate(1620 310)">
          <circle r="262" fill="url(#aa-aura)"/>
          <g fill="none" stroke="url(#aa-ring)">
            <circle r="252" strokeWidth="1.4"/><circle r="245" strokeWidth=".85"/><circle r="234" strokeWidth=".75" opacity=".66"/>
            <circle r="196" strokeWidth="1" strokeDasharray="1 11"/>
            <ellipse rx="270" ry="108" transform="rotate(-35)" opacity=".55"/>
            <ellipse rx="243" ry="155" transform="rotate(53)" opacity=".32"/>
          </g>
          <g className="aat-ring-ticks" stroke="#e6bf7e">
            {orbitMarks.map(i=><path key={i} transform={`rotate(${i*3})`} d={i%10===0?'M0 -243v13':i%5===0?'M0 -243v9':'M0 -243v3.3'} opacity={i%5===0?.76:.49} strokeWidth={i%5===0?1.4:.8}/>)}
          </g>
          {[[-224,-116],[-109,-227],[177,-178],[246,55],[40,249]].map(([x,y],i)=><Star key={i} x={x} y={y} r={i%2?8:11}/>)}
        </g>
        <g className="aat-stars">{sparkles.map(([x,y,r])=><Star key={x} x={x} y={y} r={r}/>)}</g>
      </g>
      <g transform="translate(1725 482) scale(.83)" fill="#121315" stroke="#29201b" strokeWidth=".9">
        <ellipse cy="-63" rx="4.7" ry="6.6"/>
        <path d="M-4-57q4 2 8 0l6 3 13-6 12-10 2 1-11 13-17 10-2 15 1 14 3 17h-6L0-25-4 0h-6l2-20 1-15-3-12-17-9-10-12 2-2 12 10 15 6z"/>
        <path d="m34-69 2-4 1 .6-.5 2 2-2 1 .7-3 4zm-69 0-2-4-1 .8 1 2-3-2-.5 1 3 4z"/>
      </g>
    </svg>
  </div>;
}
