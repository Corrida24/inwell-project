import React from 'react';

export type MeasureKind = 'height' | 'weight' | 'waist' | 'hip' | 'chest' | 'neck' | 'arm' | 'thigh';

/**
 * Simple schematic line-art showing where/how to take each measurement.
 * Deliberately minimal (not photographic) — good enough for a v1 self-entry
 * flow; swap for photographed/illustrated assets later without touching
 * any layout code, since every field consumes this through one component.
 */
const Silhouette: React.FC<{ band?: { cx: number; cy: number; rx: number; ry: number } }> = ({ band }) => (
  <svg viewBox="0 0 100 200" className="w-16 h-32" fill="none">
    {/* голова */}
    <circle cx="50" cy="18" r="13" className="fill-sky-100 stroke-brand-blue" strokeWidth="2" />
    {/* торс */}
    <path
      d="M36,34 L64,34 L70,58 L67,98 L61,128 L39,128 L33,98 L30,58 Z"
      className="fill-sky-50 stroke-brand-blue"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* руки */}
    <path d="M36,37 L19,42 L15,88 L22,90 L29,50 Z" className="fill-sky-50 stroke-brand-blue" strokeWidth="2" strokeLinejoin="round" />
    <path d="M64,37 L81,42 L85,88 L78,90 L71,50 Z" className="fill-sky-50 stroke-brand-blue" strokeWidth="2" strokeLinejoin="round" />
    {/* ноги */}
    <path d="M39,128 L35,193 L47,193 L49,128 Z" className="fill-sky-50 stroke-brand-blue" strokeWidth="2" strokeLinejoin="round" />
    <path d="M61,128 L51,128 L53,193 L65,193 Z" className="fill-sky-50 stroke-brand-blue" strokeWidth="2" strokeLinejoin="round" />
    {band && (
      <ellipse
        cx={band.cx}
        cy={band.cy}
        rx={band.rx}
        ry={band.ry}
        className="fill-none stroke-brand-teal"
        strokeWidth="3"
        strokeDasharray="4 3"
      />
    )}
  </svg>
);

const RulerIcon: React.FC = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32" fill="none">
    <rect x="38" y="8" width="24" height="184" rx="4" className="fill-sky-50 stroke-brand-blue" strokeWidth="2" />
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
      <line key={i} x1="38" y1={8 + i * 18} x2={i % 2 === 0 ? 52 : 62} y2={8 + i * 18} className="stroke-brand-blue" strokeWidth="2" />
    ))}
    <path d="M50,8 L44,-2 L56,-2 Z" className="fill-brand-teal" transform="translate(0,4)" />
  </svg>
);

const ScaleIcon: React.FC = () => (
  <svg viewBox="0 0 100 200" className="w-16 h-32" fill="none">
    <rect x="15" y="140" width="70" height="45" rx="8" className="fill-sky-50 stroke-brand-blue" strokeWidth="2" />
    <circle cx="50" cy="162" r="14" className="fill-white stroke-brand-teal" strokeWidth="2.5" />
    <line x1="50" y1="162" x2="57" y2="154" className="stroke-brand-teal" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M39,193 L35,120 M61,193 L65,120" className="stroke-brand-blue" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
  </svg>
);

const BAND: Record<Exclude<MeasureKind, 'height' | 'weight'>, { cx: number; cy: number; rx: number; ry: number }> = {
  neck: { cx: 50, cy: 33, rx: 10, ry: 5 },
  chest: { cx: 50, cy: 52, rx: 21, ry: 7 },
  waist: { cx: 50, cy: 80, rx: 19, ry: 6 },
  hip: { cx: 50, cy: 104, rx: 20, ry: 7 },
  arm: { cx: 23, cy: 62, rx: 9, ry: 6 },
  thigh: { cx: 43, cy: 138, rx: 10, ry: 6 },
};

export const MeasureIllustration: React.FC<{ kind: MeasureKind; className?: string }> = ({ kind, className = '' }) => (
  <div className={`shrink-0 ${className}`}>
    {kind === 'height' ? <RulerIcon /> : kind === 'weight' ? <ScaleIcon /> : <Silhouette band={BAND[kind]} />}
  </div>
);
