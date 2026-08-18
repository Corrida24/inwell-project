import React, { useState } from 'react';
import { Award, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal } from './ui/Reveal';

export const CertificatesSection: React.FC = () => {
  const { t } = useLanguage();
  const c = t.certificates;
  const [open, setOpen] = useState(false);

  return (
    <section id="certificates" className="relative py-10 sm:py-20 bg-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="amber" className="opacity-50" />

      <div className="max-w-3xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-amber-200 shadow-sm text-amber-700 text-xs font-semibold uppercase">
            <Award className="w-3.5 h-3.5" /> {c.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{c.heading}</h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">{c.subtitle}</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            {c.optionalNote}
          </span>
        </Reveal>

        <Reveal delay={0.05}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group block mx-auto w-40 sm:w-48 bg-white border border-sky-200 rounded-xl p-2 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-zoom-in"
          >
            <img src="/certificate-corporate.jpg" alt={c.corpAlt} className="w-full h-auto rounded-lg border border-sky-100" />
            <p className="text-center text-xs font-semibold text-slate-700 mt-2">{c.corpCaption}</p>
            <p className="text-center text-[11px] text-slate-400">{c.corpSub}</p>
            <p className="text-center text-xs font-bold text-brand-blue mt-1">{c.corpPrice}</p>
          </button>
        </Reveal>
        <p className="text-center text-xs text-slate-400 mt-4">{c.vatNote}</p>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.common.close}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src="/certificate-corporate.jpg"
            alt={c.corpAlt}
            onClick={() => setOpen(false)}
            className="max-w-full max-h-[85vh] w-auto h-auto rounded-2xl shadow-2xl cursor-zoom-out"
          />
        </div>
      )}
    </section>
  );
};
