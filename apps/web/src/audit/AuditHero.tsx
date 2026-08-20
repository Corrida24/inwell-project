import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Eye, Ruler, Scale as ScaleIcon } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from '../components/ui/SectionGlow';
import { getTotalStatsCount } from './api';

export const AuditHero: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { t, lang } = useLanguage();
  const h = t.audit.hero;

  // null, пока не загрузился (или недоступен) — строка просто не рендерится,
  // без "прыжка" layout и без нуля/заглушки на месте реального числа.
  const [statsCount, setStatsCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    getTotalStatsCount().then((count) => {
      if (!cancelled) setStatsCount(count);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative pt-20 pb-10 sm:pt-32 sm:pb-20 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50/30">
      <SectionGlow variant="teal" />
      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
          <div className="text-center lg:text-left space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-slate-700 text-xs sm:text-sm font-medium">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-teal animate-pulse" />
              <span>{h.badge}</span>
            </div>

            <h1 className="text-[30px] leading-[1.15] sm:text-5xl font-bold text-slate-900 tracking-tight">{h.title}</h1>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold">
              {h.freeBadge}
            </div>

            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">{h.subtitle}</p>

            <div className="flex flex-col xs:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-brand-blue hover:bg-brand-blue-light transition-all shadow-lg shadow-blue-500/25 active:scale-95"
              >
                <span>{h.cta}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/example"
                className="inline-flex items-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all active:scale-95"
              >
                <Eye className="w-5 h-5" />
                <span>{h.ctaExample}</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 max-w-xl mx-auto lg:mx-0 pt-1">
              {h.perks.map((perk) => (
                <span key={perk} className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                  {perk}
                </span>
              ))}
            </div>

            {statsCount !== null && statsCount > 0 && (
              <p className="text-sm sm:text-base text-slate-600">
                {h.statsPrefix} <span className="font-bold text-slate-900">{statsCount.toLocaleString(lang === 'uz' ? 'uz-UZ' : 'ru-RU')}</span> {h.statsSuffix}
              </p>
            )}

            <p className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-500 pt-1 sm:pt-2">
              <Ruler className="w-3.5 h-3.5 text-brand-teal shrink-0" />
              <ScaleIcon className="w-3.5 h-3.5 text-brand-teal shrink-0" />
              <span>{h.note}</span>
            </p>
          </div>

          {/* Мини-мокап личного отчёта — та же визуальная грамматика, что и в
             дашборд-мокапах на /corporate: карточка-браузер вместо абзаца. */}
          <div className="hidden lg:block">
            <div className="bg-white border border-sky-200 rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-sky-100 bg-slate-50/60">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 text-[11px] font-semibold text-slate-400">{h.heroMock.chromeLabel}</span>
              </div>
              <div className="p-5 flex items-center gap-5">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="relative w-20 h-20 rounded-full border-[6px] border-sky-100 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[6px] border-brand-teal border-r-transparent border-b-transparent rotate-[20deg]" />
                    <span className="text-xl font-extrabold text-slate-900">84</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 tracking-wide mt-1">{h.heroMock.scoreCaption}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">{h.heroMock.groupLabel}</span>
                      <span className="font-bold text-slate-900">62%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sky-50 overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: '62%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">{h.heroMock.inwellLabel}</span>
                      <span className="font-bold text-slate-900">70%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sky-50 overflow-hidden">
                      <div className="h-full bg-brand-teal rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
