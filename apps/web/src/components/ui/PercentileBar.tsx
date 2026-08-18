import React from 'react';
import { motion } from 'motion/react';

interface PercentileBarProps {
  percent: number; // 0-100, position on the distribution
  note: string;
  className?: string;
}

/**
 * Shows "you are here" on a distribution track — used to make percentile
 * claims in the report preview feel like a measurement, not just a line of text.
 */
export const PercentileBar: React.FC<PercentileBarProps> = ({ percent, note, className = '' }) => {
  const clamped = Math.max(2, Math.min(98, percent));

  return (
    <div className={className}>
      <div className="relative h-2.5 rounded-full bg-gradient-to-r from-rose-200 via-amber-200 to-teal-300 overflow-visible">
        <motion.div
          className="absolute -top-1.5 flex flex-col items-center"
          style={{ left: `${clamped}%`, transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, y: -4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="w-5 h-5 rounded-full bg-white border-2 border-brand-blue shadow-md" />
        </motion.div>
      </div>
      <p className="text-xs text-slate-500 mt-3 leading-relaxed">{note}</p>
    </div>
  );
};
