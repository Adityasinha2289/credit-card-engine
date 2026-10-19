/**
 * The forest-green leather card holder from the landing page. Cards slide in
 * behind its front; the landing hero and My RenoCred's Overview both use it.
 */
import { useId } from 'react';

/**
 * Outline of the holder's front, inset by `d`: a rounded rectangle with a thumb
 * notch scooped out of the top edge. d = 0 is the cut edge; d > 0 is a stitch line.
 */
function holderPath(w: number, h: number, r: number, n: number, d: number) {
  const rr = r - d;
  const nn = n + d;
  return [
    `M ${d + rr} ${d}`,
    `L ${w / 2 - nn} ${d}`,
    `A ${nn} ${nn} 0 0 0 ${w / 2 + nn} ${d}`,
    `L ${w - d - rr} ${d}`,
    `A ${rr} ${rr} 0 0 1 ${w - d} ${d + rr}`,
    `L ${w - d} ${h - d - rr}`,
    `A ${rr} ${rr} 0 0 1 ${w - d - rr} ${h - d}`,
    `L ${d + rr} ${h - d}`,
    `A ${rr} ${rr} 0 0 1 ${d} ${h - d - rr}`,
    `L ${d} ${d + rr}`,
    `A ${rr} ${rr} 0 0 1 ${d + rr} ${d}`,
    'Z',
  ].join(' ');
}

/** A forest-green leather card holder: grain, painted edges, stitching, a stitched lower pocket and a debossed name. */
export function HolderFront({ w, h }: { w: number; h: number }) {
  const id = useId().replace(/:/g, '');
  const r = h * 0.15;
  const n = h * 0.24;
  const seam = h * 0.56;
  const outline = holderPath(w, h, r, n, 0);
  const stitch = holderPath(w, h, r, n, 9);
  const s = 9;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 overflow-visible" style={{ pointerEvents: 'none' }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-leather`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#386544" />
          <stop offset="0.55" stopColor="#264C30" />
          <stop offset="1" stopColor="#17331F" />
        </linearGradient>
        <linearGradient id={`${id}-pocket`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#21432B" />
          <stop offset="1" stopColor="#122A1A" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.3" /></feComponentTransfer>
        </filter>
        <clipPath id={`${id}-clip`}><path d={outline} /></clipPath>
      </defs>

      <path d={outline} fill={`url(#${id}-leather)`} style={{ pointerEvents: 'visiblePainted' }} />
      <g clipPath={`url(#${id}-clip)`}>
        {/* the lower pocket: a second piece of leather sewn across */}
        <path d={`M 0 ${seam} Q ${w / 2} ${seam - 12} ${w} ${seam} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id}-pocket)`} />
        <path d={`M 0 ${seam} Q ${w / 2} ${seam - 12} ${w} ${seam}`} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
        <path d={`M 0 ${seam + 1.5} Q ${w / 2} ${seam - 10.5} ${w} ${seam + 1.5}`} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <path d={`M ${s} ${seam + 8} Q ${w / 2} ${seam - 4} ${w - s} ${seam + 8}`} fill="none" stroke="#E3EED4" strokeOpacity="0.4" strokeWidth="1.4" strokeDasharray="5 4" strokeLinecap="round" />
        <rect width={w} height={h} fill={`url(#${id}-sheen)`} />
        <rect width={w} height={h} filter={`url(#${id}-grain)`} style={{ mixBlendMode: 'soft-light' }} />
      </g>

      {/* debossed name on the pocket */}
      <text x={w / 2} y={seam + (h - seam) / 2 + 6} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={h * 0.075} letterSpacing="0.32em" fill="rgba(255,255,255,0.08)" dy="1">RENOCRED</text>
      <text x={w / 2} y={seam + (h - seam) / 2 + 6} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={h * 0.075} letterSpacing="0.32em" fill="rgba(0,0,0,0.32)">RENOCRED</text>

      {/* stitching, then the painted edge */}
      <path d={stitch} fill="none" stroke="#E3EED4" strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="5 4" strokeLinecap="round" />
      <path d={outline} fill="none" stroke="#0A1F15" strokeOpacity="0.9" strokeWidth="2" />
      <path d={holderPath(w, h, r, n, 2)} fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1" />
    </svg>
  );
}

