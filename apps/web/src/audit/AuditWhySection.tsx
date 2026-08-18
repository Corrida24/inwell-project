import React from 'react';
import { getIcon } from '../utils/iconMap';
import { useLanguage } from '../i18n/LanguageContext';
import { Reveal, RevealStagger, RevealItem } from '../components/ui/Reveal';

/** "Зачем" block — right after the hero on /personal. A handful of short,
 * concrete reasons to fill in the form, not a sales pitch. */
export const AuditWhySection: React.FC = () => {
  const { t } = useLanguage();
  const w = t.audit.why;

  return (
    <section className="relative py-8 sm:py-16 bg-sky-50/50 border-b border-sky-100">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <Reveal className="text-center mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{w.heading}</h2>
        </Reveal>

        <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
          {w.items.map((item) => {
            const Icon = getIcon(item.iconName);
            return (
              <RevealItem key={item.title}>
                <div className="h-full bg-white border border-sky-200 rounded-xl p-3 sm:p-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mb-1 leading-snug">{item.title}</div>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">{item.desc}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
};
