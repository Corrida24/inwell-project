import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { getIcon } from '../utils/iconMap';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from './ui/Reveal';

export const FollowUpServicesSection: React.FC = () => {
  const { t } = useLanguage();
  const f = t.followup;

  return (
    <section id="followup" className="relative py-10 sm:py-20 bg-gradient-to-b from-sky-50/50 to-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="teal" className="opacity-40" />

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-slate-700 text-xs font-semibold uppercase">
            <HeartHandshake className="w-3.5 h-3.5 text-brand-teal" /> {f.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{f.heading}</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">{f.subtitle}</p>
        </Reveal>

        <RevealStagger className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 mb-6 sm:mb-8">
          {f.services.map((service) => {
            const Icon = getIcon(service.iconName);
            return (
              <RevealItem key={service.title}>
                <div className="h-full flex flex-col bg-white border border-sky-200 rounded-2xl p-3.5 sm:p-6 hover:-translate-y-1 hover:shadow-md hover:border-brand-teal/40 transition-all duration-300">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-2.5 sm:mb-4">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-teal" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 sm:mb-1.5">{service.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed flex-1">{service.description}</p>
                  <p className="text-sm font-bold text-brand-blue mt-2 sm:mt-3">{service.priceLabel}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
};
