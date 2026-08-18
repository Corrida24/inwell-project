import React, { useEffect, useState } from 'react';
import { ArrowRight, Ruler, Scale as ScaleIcon } from 'lucide-react';
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
      <div className="max-w-3xl mx-auto px-5 sm:px-6 relative z-10 text-center space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-slate-700 text-xs sm:text-sm font-medium">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-teal animate-pulse" />
          <span>{h.badge}</span>
        </div>

        <h1 className="text-[30px] leading-[1.15] sm:text-5xl font-bold text-slate-900 tracking-tight">{h.title}</h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{h.subtitle}</p>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-brand-blue hover:bg-brand-blue-light transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <span>{h.cta}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {statsCount !== null && statsCount > 0 && (
          <p className="text-sm sm:text-base text-slate-600">
            {h.statsPrefix} <span className="font-bold text-slate-900">{statsCount.toLocaleString(lang === 'uz' ? 'uz-UZ' : 'ru-RU')}</span> {h.statsSuffix}
          </p>
        )}

        <p className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1 sm:pt-2">
          <Ruler className="w-3.5 h-3.5 text-brand-teal shrink-0" />
          <ScaleIcon className="w-3.5 h-3.5 text-brand-teal shrink-0" />
          <span>{h.note}</span>
        </p>
      </div>
    </section>
  );
};
