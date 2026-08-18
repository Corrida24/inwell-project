import React from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { getIcon } from '../utils/iconMap';
import { useLanguage } from '../i18n/LanguageContext';
import { fillTemplate } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from './ui/Reveal';

const TOTAL_INPUTS = 13;
const TOTAL_INDICES = 15;
const SHOWN_COUNT = 4;

export const ParametersSection: React.FC = () => {
  const { t } = useLanguage();
  const p = t.parameters;
  const extraInputs = TOTAL_INPUTS - SHOWN_COUNT;
  const extraIndices = TOTAL_INDICES - SHOWN_COUNT;

  return (
    <section id="parameters" className="relative py-10 sm:py-20 bg-gradient-to-b from-teal-50/50 to-sky-50/50 border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="teal" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 shadow-sm text-teal-700 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" /> {p.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{p.heading}</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">{p.subtitle}</p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl border border-sky-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="font-bold text-slate-800 text-sm">{p.measuredTitle}</p>
              <span className="text-[11px] font-semibold text-brand-blue bg-sky-50 border border-sky-200 rounded-full px-2.5 py-1">
                {p.measuredBadge}
              </span>
            </div>
            <RevealStagger className="space-y-1.5 sm:space-y-3">
              {p.inputs.map((item) => {
                const Icon = getIcon(item.iconName);
                return (
                  <RevealItem key={item.id}>
                    <div className="flex items-start gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl hover:bg-sky-50 transition-colors">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                          <span className="text-[11px] text-slate-400">{item.unit}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 leading-snug">{item.businessImpact}</p>
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealStagger>
            <div className="flex items-center gap-1.5 mt-3 sm:mt-4 pl-1 text-xs text-slate-400">
              <Lock className="w-3 h-3" />
              <span>{fillTemplate(p.extraInputsNote, { count: extraInputs })}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-teal-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="font-bold text-slate-800 text-sm">{p.calculatedTitle}</p>
              <span className="text-[11px] font-semibold text-brand-teal bg-teal-50 border border-teal-200 rounded-full px-2.5 py-1">
                {p.calculatedBadge}
              </span>
            </div>
            <RevealStagger className="space-y-1.5 sm:space-y-3">
              {p.indices.map((item) => {
                const Icon = getIcon(item.iconName);
                return (
                  <RevealItem key={item.id}>
                    <div className="flex items-start gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl hover:bg-teal-50 transition-colors">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900">{item.name}</span>
                          <span className="text-[11px] text-slate-400">{item.unit}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 leading-snug">{item.businessImpact}</p>
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealStagger>
            <div className="flex items-center gap-1.5 mt-3 sm:mt-4 pl-1 text-xs text-slate-400">
              <Lock className="w-3 h-3" />
              <span>{fillTemplate(p.extraIndicesNote, { count: extraIndices })}</span>
            </div>
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="bg-white rounded-2xl border border-teal-200 p-4 sm:p-6 text-center">
            <p className="font-bold text-slate-800 text-sm mb-3 sm:mb-4">{p.breakdownTitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {p.breakdownItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
