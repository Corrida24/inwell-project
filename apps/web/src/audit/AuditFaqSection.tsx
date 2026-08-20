import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Reveal, RevealStagger, RevealItem } from '../components/ui/Reveal';
import { FaqItem } from '../components/ui/FaqAccordion';

/** Компактный FAQ-аккордеон на /personal — тот же общий FaqItem, что и на
 * /corporate (corporatePlatform.faq), с вопросами про самопроверку. */
export const AuditFaqSection: React.FC = () => {
  const { t } = useLanguage();
  const faq = t.audit.faq;

  return (
    <section className="py-8 sm:py-14 bg-white">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <Reveal className="text-center mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{faq.title}</h2>
        </Reveal>
        <RevealStagger className="space-y-2 sm:space-y-2.5">
          {faq.items.map((item) => (
            <RevealItem key={item.q}>
              <FaqItem q={item.q} a={item.a} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
};
