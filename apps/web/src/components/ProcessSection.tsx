import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ClipboardCheck,
  Link2,
  Send,
  LineChart,
  LayoutDashboard,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal } from './ui/Reveal';

const STEP_ICONS: LucideIcon[] = [
  ClipboardCheck,
  Link2,
  Send,
  LineChart,
  LayoutDashboard,
  RotateCcw,
];

const EASE = [0.22, 1, 0.36, 1] as const;

export const ProcessSection: React.FC = () => {
  const { t } = useLanguage();
  const p = t.process;
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section id="process" className="relative py-10 sm:py-20 bg-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="blue" className="opacity-60" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-1.5 sm:space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-slate-700 text-xs font-semibold uppercase">
            <Link2 className="w-3.5 h-3.5 text-brand-teal" /> {p.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {p.headingPre}{' '}
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
              {p.headingHighlight}
            </span>
            {p.headingPost}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">{p.subtitle}</p>
        </Reveal>

        {/* Connecting line, desktop only */}
        <div className="relative">
          <div className="hidden lg:block absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-100 via-sky-200 to-teal-100" />

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {p.steps.map((step, idx) => {
              const Icon = STEP_ICONS[idx] ?? ClipboardCheck;
              const isActive = activeStep === step.number;
              return (
                <motion.button
                  key={step.number}
                  onClick={() => setActiveStep(isActive ? null : step.number)}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: EASE }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative text-left bg-sky-50 border rounded-xl p-3 sm:p-5 space-y-1.5 sm:space-y-2 transition-colors duration-300 ${
                    isActive ? 'border-brand-teal bg-teal-50 shadow-md' : 'border-sky-200 hover:border-brand-teal/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <motion.span
                      animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4 }}
                      className={`relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-white text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-brand-teal' : 'bg-brand-blue'
                      }`}
                    >
                      {step.number}
                    </motion.span>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[13px] sm:text-sm font-bold text-slate-900 block leading-snug">{step.title}</span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.description}</p>

                  <motion.div
                    initial={false}
                    animate={{
                      height: isActive ? 'auto' : 0,
                      opacity: isActive ? 1 : 0,
                      marginTop: isActive ? 8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-teal bg-white border border-teal-200 rounded-lg px-2 py-1">
                      {p.resultLabel} {step.deliverable}
                    </span>
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
