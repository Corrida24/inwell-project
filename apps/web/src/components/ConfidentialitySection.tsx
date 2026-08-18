import React from 'react';
import { ShieldCheck, Users, Lock, LayoutDashboard, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from './ui/Reveal';

const FLOW_ICONS = [Users, Lock, LayoutDashboard];

export const ConfidentialitySection: React.FC = () => {
  const { t } = useLanguage();
  const c = t.confidentiality;

  return (
    <section id="confidentiality" className="relative py-10 sm:py-20 bg-gradient-to-b from-sky-50/50 to-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="teal" className="opacity-50" />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 shadow-sm text-teal-700 text-xs font-semibold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> {c.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{c.heading}</h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="bg-white border border-teal-200 rounded-2xl p-4 sm:p-7 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
              {c.flowSteps.map((step, idx) => {
                const Icon = FLOW_ICONS[idx] ?? Users;
                return (
                  <React.Fragment key={step}>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-teal-50 border border-teal-200">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-teal-200 flex items-center justify-center shrink-0">
                        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-teal" />
                      </span>
                      <span className="text-[11px] sm:text-sm font-semibold text-slate-700">{step}</span>
                    </div>
                    {idx < c.flowSteps.length - 1 && (
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 shrink-0" aria-hidden />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed text-center max-w-2xl mx-auto">
              {c.statement}
            </p>

            <div className="flex items-center justify-center gap-1.5 text-xs text-brand-teal">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{c.lawNote}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-4 sm:mt-8">
          <div className="bg-white border border-sky-200 rounded-2xl p-4 sm:p-7">
            <div className="text-center max-w-xl mx-auto mb-4 sm:mb-5 space-y-1 sm:space-y-1.5">
              <p className="text-base font-bold text-slate-900">{c.employeesTitle}</p>
              <p className="text-sm text-slate-500">{c.employeesSubtitle}</p>
            </div>

            <RevealStagger className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              {c.employeesList.map((item) => (
                <RevealItem key={item}>
                  <div className="h-full flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-sky-50 border border-sky-100">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-snug">{item}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
