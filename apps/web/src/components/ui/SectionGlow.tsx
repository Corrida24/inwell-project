import React from 'react';

interface SectionGlowProps {
  variant?: 'blue' | 'teal' | 'rose' | 'amber';
  position?: 'top' | 'bottom';
  className?: string;
}

const GRADIENTS: Record<string, string> = {
  blue: 'from-blue-200/40 via-sky-200/30 to-teal-200/40',
  teal: 'from-teal-200/40 via-emerald-200/30 to-sky-200/30',
  rose: 'from-rose-200/35 via-orange-100/30 to-amber-100/30',
  amber: 'from-amber-200/35 via-orange-100/25 to-teal-100/30',
};

/**
 * Ambient blurred glow, reused from the Hero section so every part of the
 * page shares the same soft, light atmosphere instead of feeling bolted on.
 */
export const SectionGlow: React.FC<SectionGlowProps> = ({
  variant = 'blue',
  position = 'top',
  className = '',
}) => (
  <div
    aria-hidden
    className={`absolute ${
      position === 'top' ? 'top-0' : 'bottom-0'
    } left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr ${GRADIENTS[variant]} blur-[100px] rounded-full pointer-events-none ${className}`}
  />
);
