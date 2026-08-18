import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Reveal, RevealStagger, RevealItem } from './ui/Reveal';

/**
 * Same composition on every breakpoint: the first 3 questions are shown
 * open (question + answer, no click needed) so a visitor gets an instant
 * answer without any interaction. All 19 questions in one long list (or
 * even one open-by-default accordion) reads as "wall of text" — so the
 * rest stay behind a single "Показать все вопросы и ответы" toggle,
 * grouped into categories and closed by default once revealed.
 */
export const FaqSection: React.FC = () => {
  const { t } = useLanguage();
  const f = t.faq;
  const [showAll, setShowAll] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const previewItems = useMemo(() => f.items.slice(0, 3), [f.items]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const map: Record<string, typeof f.items> = {};
    for (const item of f.items) {
      const key = item.category ?? 'other';
      if (!map[key]) {
        map[key] = [];
        order.push(key);
      }
      map[key].push(item);
    }
    return order.map((key) => ({
      key,
      label: f.categories?.[key as keyof typeof f.categories] ?? key,
      items: map[key],
    }));
  }, [f.items, f.categories]);

  return (
    <section id="faq" className="py-10 sm:py-20 bg-sky-50/50 border-b border-sky-100">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <Reveal className="text-center mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-sky-200 text-slate-700 text-xs font-semibold uppercase">
            <HelpCircle className="w-3.5 h-3.5 text-brand-teal" /> {f.badge}
          </span>
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">{f.heading}</h2>
        </Reveal>

        {!showAll && (
          <RevealStagger className="space-y-2.5 sm:space-y-3">
            {previewItems.map((item) => (
              <RevealItem key={item.id}>
                <div className="bg-white border border-sky-200 rounded-xl px-3.5 py-3 sm:p-5">
                  <p className="font-semibold text-slate-900 text-[13px] sm:text-base mb-1 sm:mb-1.5">{item.question}</p>
                  <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        )}

        {showAll && (
          <div className="space-y-5 sm:space-y-7">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  {group.label}
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {group.items.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={`bg-white border rounded-xl overflow-hidden transition-colors ${
                          isOpen ? 'border-brand-teal shadow-sm' : 'border-sky-200'
                        }`}
                      >
                        <button
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                          aria-expanded={isOpen}
                          className="w-full text-left px-3.5 py-2.5 sm:p-5 flex items-center justify-between gap-3 font-semibold text-slate-900 text-[13px] sm:text-base hover:text-brand-teal transition-colors min-h-[44px] sm:min-h-0"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-brand-teal' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key="answer"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 text-[13px] sm:text-sm text-slate-600 leading-relaxed border-t border-sky-100 pt-2.5 sm:pt-3">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-5 sm:mt-7">
          <button
            type="button"
            onClick={() => {
              setShowAll((v) => !v);
              setOpenFaqId(null);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-brand-blue bg-white border border-sky-200 hover:bg-sky-50 transition-colors"
          >
            <span>{showAll ? f.hideAllLabel : f.showAllLabel}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </section>
  );
};
