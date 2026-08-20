import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/** Один пункт компактного bento-аккордеона FAQ — один открытый вопрос за
 * раз в рамках своего родителя, ответ 1-2 предложения. Используется и на
 * /corporate (corporatePlatform.faq), и на /personal (audit.faq) — общий
 * визуальный код для "единого продукта". Не путать с более "тяжёлым"
 * FaqSection.tsx на /corporate/fit-audit (длинный лендинг с деталями). */
export const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-sky-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left px-4 py-3 sm:px-5 sm:py-3.5"
      >
        <span className="text-sm font-semibold text-slate-800">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-4 pb-3.5 sm:px-5 sm:pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>}
    </div>
  );
};
