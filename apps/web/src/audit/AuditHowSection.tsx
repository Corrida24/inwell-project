import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getIcon } from '../utils/iconMap';
import { useLanguage } from '../i18n/LanguageContext';
import { Reveal, RevealStagger, RevealItem } from '../components/ui/Reveal';

/** "Как это работает" — тот же flowchart-паттерн (карточка + стрелка), что
 * и в CorporatePage (Create → Send → Collect → Analyze), только с 3 шагами
 * пользовательского пути на /personal. Часть унификации дизайн-кода B2B/B2C. */
export const AuditHowSection: React.FC = () => {
  const { t } = useLanguage();
  const how = t.audit.how;

  return (
    <section className="py-8 sm:py-14 bg-gradient-to-b from-sky-50/60 to-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <Reveal className="text-center mb-5 sm:mb-8">
          <h2 className="text-base sm:text-xl font-bold text-slate-900">{how.title}</h2>
        </Reveal>
        <RevealStagger className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-2.5">
          {how.steps.map((step, idx) => {
            const Icon = getIcon(step.iconName);
            return (
              <React.Fragment key={step.key}>
                <RevealItem>
                  <div className="bg-white border border-sky-200 rounded-2xl p-3.5 sm:p-4 text-center w-full sm:w-40 space-y-1.5">
                    <span className="w-9 h-9 mx-auto rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-brand-teal" />
                    </span>
                    <div className="text-sm font-bold text-slate-900">{step.title}</div>
                    <div className="text-[11px] text-slate-400">{step.actor}</div>
                    <div className="text-[10px] font-medium text-brand-blue bg-sky-50 rounded-md px-1.5 py-1 truncate">{step.micro}</div>
                  </div>
                </RevealItem>
                {idx < how.steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mx-auto rotate-90 sm:rotate-0" aria-hidden />
                )}
              </React.Fragment>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
};
