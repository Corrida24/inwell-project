import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Wallet, TrendingDown, Users } from 'lucide-react';
import { getIcon } from '../utils/iconMap';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from './ui/Reveal';
import { CountUp } from './ui/AnimatedNumber';

const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const OVERWEIGHT_PERCENT = 50;
const PROFIT_LOSS_PERCENT = 10;

export const ProblemSection: React.FC = () => {
  const { t } = useLanguage();
  const p = t.problem;

  return (
    <section id="problem" className="relative py-10 sm:py-20 bg-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="rose" className="opacity-70" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-rose-200 shadow-sm text-rose-700 text-xs font-semibold uppercase">
            <AlertCircle className="w-3.5 h-3.5" /> {p.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {p.headingPre}{' '}
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
              {p.headingHighlight}
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">{p.subtitle}</p>
        </Reveal>

        <RevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {p.stats.map((stat, idx) => {
            const Icon = getIcon(stat.iconName);
            return (
              <RevealItem key={idx}>
                <div className="group h-full bg-gradient-to-br from-sky-50 to-white border border-sky-200/80 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:-translate-y-1 hover:border-brand-teal/40 transition-all duration-300">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 group-hover:bg-brand-teal group-hover:border-brand-teal transition-all duration-300">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-teal group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-blue mb-1">
                    {stat.prefix}
                    <CountUp value={stat.number} />
                    {stat.suffix}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{stat.label}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{stat.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2 italic">{stat.source}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>

        {/* Financial impact — the headline "this costs you money" moment */}
        <Reveal delay={0.1}>
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue to-brand-teal rounded-2xl p-5 sm:p-8 text-white shadow-xl shadow-blue-900/10">
            <div
              aria-hidden
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/10 blur-2xl"
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8">
              {/* Overweight ring */}
              <div className="flex flex-col items-center gap-2 mx-auto md:mx-0">
                <div className="relative w-24 h-24 sm:w-36 sm:h-36">
                  <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                    <circle
                      cx="70"
                      cy="70"
                      r={RING_RADIUS}
                      strokeWidth="12"
                      fill="none"
                      className="stroke-white/20"
                    />
                    <motion.circle
                      cx="70"
                      cy="70"
                      r={RING_RADIUS}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      className="stroke-white"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
                      whileInView={{
                        strokeDashoffset: RING_CIRCUMFERENCE * (1 - OVERWEIGHT_PERCENT / 100),
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold">
                      <CountUp value={OVERWEIGHT_PERCENT} format={(n) => `${Math.round(n)}%`} />
                    </span>
                    <Users className="w-3.5 h-3.5 text-blue-100 mt-1" />
                  </div>
                </div>
                <p className="text-xs text-blue-100 text-center max-w-[10rem]">{p.financial.overweightLabel}</p>
              </div>

              {/* Headline */}
              <div className="text-center md:text-left space-y-1.5 sm:space-y-2">
                <p className="text-lg sm:text-2xl font-bold leading-snug">{p.financial.headline}</p>
                <p className="text-sm text-blue-100 max-w-xl mx-auto md:mx-0">{p.financial.subheadline}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 text-xs font-medium">
                    <Wallet className="w-3.5 h-3.5" /> {p.financial.chip1}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 text-xs font-medium">
                    <TrendingDown className="w-3.5 h-3.5" /> {p.financial.chip2}
                  </span>
                </div>
              </div>

              {/* Profit loss number */}
              <div className="flex flex-col items-center gap-1 mx-auto md:mx-0 md:pl-6 md:border-l md:border-white/20">
                <span className="text-xs text-blue-100 uppercase tracking-wide">{p.financial.untilLabel}</span>
                <span className="text-4xl sm:text-6xl font-bold tracking-tight">
                  <CountUp value={PROFIT_LOSS_PERCENT} format={(n) => `${Math.round(n)}%`} />
                </span>
                <span className="text-xs text-blue-100 text-center max-w-[9rem]">{p.financial.profitLossLabel}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
