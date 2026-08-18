import React from 'react';
import { motion } from 'motion/react';

interface CircleGaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorClassName?: string; // stroke color class, e.g. 'stroke-brand-teal'
  trackClassName?: string;
  valueClassName?: string;
  delay?: number;
}

/**
 * Small reusable donut gauge used across the report-preview mockups.
 * Renders 0 → value on scroll-into-view, matching the ring used in the
 * "Это бьёт по деньгам" block so report visuals feel like one family.
 */
export const CircleGauge: React.FC<CircleGaugeProps> = ({
  value,
  size = 128,
  strokeWidth = 12,
  label,
  sublabel,
  colorClassName = 'stroke-brand-teal',
  trackClassName = 'stroke-sky-100',
  valueClassName = 'text-slate-900',
  delay = 0,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className={trackClassName}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          className={colorClassName}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className={`text-xl sm:text-2xl font-bold ${valueClassName}`}>{label}</span>}
        {sublabel && <span className="text-[10px] text-slate-400 mt-0.5 text-center px-2">{sublabel}</span>}
      </div>
    </div>
  );
};
