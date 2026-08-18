import React from 'react';
import { ArrowRight, FileSearch, CheckCircle2, Building2, Link2, Users, BarChart3 } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactsModal } from './ContactsModalContext';
import { SectionGlow } from './ui/SectionGlow';

const FLOW_ICONS = [Building2, Link2, Users, BarChart3];

export const Hero: React.FC = () => {
  const { t } = useLanguage();
  const { open: openContacts } = useContactsModal();
  const h = t.hero;

  return (
    <section className="relative pt-20 pb-10 sm:pt-32 sm:pb-20 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50/30">
      <SectionGlow variant="blue" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-8 items-center">
          <div className="text-center lg:text-left space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-slate-700 text-xs sm:text-sm font-medium">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-teal animate-pulse" />
              <span>{h.badge}</span>
            </div>

            <h1 className="text-[28px] leading-[1.15] sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight sm:leading-[1.15]">
              {h.titlePre}{' '}
              <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
                {h.titleHighlight}
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {h.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2">
              {h.badges.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white border border-teal-200/80 text-teal-900 text-xs sm:text-sm"
                >
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-teal shrink-0" />
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={openContacts}
                className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>{h.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#report-example"
                className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-sky-50 text-slate-800 font-semibold text-sm border border-sky-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <FileSearch className="w-4 h-4 text-brand-teal" />
                <span>{h.ctaSecondary}</span>
              </a>
            </div>
          </div>

          {/* Фото команды/офиса Inwell */}
          <div className="hidden lg:flex items-center justify-center">
            <img
              src="/hero-office-photo.jpg"
              alt="Команда Inwell в офисе клиента"
              className="w-full aspect-[3/2] object-cover rounded-3xl border border-sky-200 shadow-sm"
            />
          </div>
        </div>

        {/* Механика в 4 шага: компания → ссылка → сотрудники заполняют → корпоративный отчёт */}
        <div className="mt-6 sm:mt-12 flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
          {h.flowSteps.map((step, idx) => {
            const Icon = FLOW_ICONS[idx] ?? Building2;
            return (
              <React.Fragment key={step}>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white border border-sky-200 shadow-sm">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-teal" />
                  </span>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-700">{step}</span>
                </div>
                {idx < h.flowSteps.length - 1 && (
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 shrink-0" aria-hidden />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
};
