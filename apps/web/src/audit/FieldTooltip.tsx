import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { MeasureIllustration, type MeasureKind } from './MeasureIllustration';
import { useLanguage } from '../i18n/LanguageContext';

interface FieldTooltipProps {
  title: string;
  text: string;
  illustration?: MeasureKind;
}

/**
 * The "?" next to a field. Tap/click to open (not hover-only — this form
 * will mostly be filled on a phone, where hover doesn't exist).
 *
 * The popover is centered on the trigger by default, but on narrow screens
 * that can push it past the left/right edge of the viewport — so after it
 * mounts we measure its actual position and nudge it back on-screen.
 */
export const FieldTooltip: React.FC<FieldTooltipProps> = ({ title, text, illustration }) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }
    const el = popRef.current;
    if (!el) return;
    const margin = 10;
    const rect = el.getBoundingClientRect();
    if (rect.left < margin) {
      setShift(margin - rect.left);
    } else if (rect.right > window.innerWidth - margin) {
      setShift(window.innerWidth - margin - rect.right);
    }
  }, [open]);

  return (
    <span className="relative inline-block align-middle" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={title}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-brand-blue hover:bg-sky-200 transition-colors ml-1.5 align-middle"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div
          ref={popRef}
          style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
          className="absolute z-30 left-1/2 top-full mt-2 w-[min(17rem,calc(100vw-1.5rem))] bg-white border border-sky-200 rounded-xl shadow-xl p-3.5"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600"
            aria-label={t.common.close}
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-3">
            {illustration && <MeasureIllustration kind={illustration} />}
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{title}</p>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{text}</p>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};
