import React from 'react';
import { motion } from 'motion/react';

interface MiniBarChartProps {
  data: { name: string; score: number }[];
  className?: string;
}

const barColor = (score: number) => {
  if (score >= 85) return 'bg-brand-teal';
  if (score >= 70) return 'bg-brand-blue-light';
  return 'bg-rose-400';
};

export const MiniBarChart: React.FC<MiniBarChartProps> = ({ data, className = '' }) => (
  <div className={`space-y-2.5 ${className}`}>
    {data.map((row, idx) => (
      <div key={row.name} className="flex items-center gap-3">
        <span className="w-16 sm:w-20 text-xs text-slate-500 shrink-0">{row.name}</span>
        <div className="flex-1 h-2.5 rounded-full bg-sky-50 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor(row.score)}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${row.score}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="w-8 text-xs font-bold text-slate-700 text-right shrink-0">{row.score}</span>
      </div>
    ))}
  </div>
);
