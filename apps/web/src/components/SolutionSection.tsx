import React from 'react';
import { CheckCircle, ShieldCheck, BarChart3, Link2, Laptop } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from './ui/Reveal';

const DELIVERABLE_ICONS = [Link2, Laptop, ShieldCheck, BarChart3];

export const SolutionSection: React.FC = () => {
  const { t } = useLanguage();
  const s = t.solution;

  return (
    <section id="solution" className="relative py-10 sm:py-20 bg-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="teal" className="opacity-50" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {s.headingPre}{' '}
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
              {s.headingHighlight}
            </span>
            {s.headingPost}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{s.subtitle}</p>
        </Reveal>

        <Reveal className="mb-6 sm:mb-10">
          <div className="bg-white border border-teal-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
              <CheckCircle className="w-5 h-5 text-brand-teal" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{s.isTitle}</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 sm:gap-y-2">
              {s.isList.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <RevealStagger className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {s.deliverables.map((d, idx) => {
            const Icon = DELIVERABLE_ICONS[idx] ?? Link2;
            return (
              <RevealItem key={d.title}>
                <div className="h-full bg-white p-3 sm:p-5 rounded-xl border border-sky-200 text-center space-y-1 sm:space-y-1.5 hover:-translate-y-1 hover:shadow-md hover:border-brand-teal/40 transition-all duration-300">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-teal mx-auto" />
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{d.title}</div>
                  <div className="text-[11px] sm:text-xs text-slate-500">{d.desc}</div>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
};
