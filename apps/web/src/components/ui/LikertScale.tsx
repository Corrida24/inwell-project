import React from 'react';

interface LikertScaleProps {
  min: number;
  max: number;
  value: number | null;
  onChange: (v: number) => void;
  /** Подпись под левым/правым концом шкалы (например "Точно нет"/"Точно да"
   * для рейтинга 0-10, или "Не согласен"/"Согласен" для Likert 1-5). */
  minLabel?: string;
  maxLabel?: string;
  error?: boolean;
}

/**
 * Ряд кликабельных "таблеток" от min до max — общий примитив для рейтинга
 * лояльности (0-10) и Likert-шкалы согласия (1-5) у остальных 4 новых
 * тестов. В проекте не было готового radio/scale-компонента — этот новый,
 * но следует тем же классам-соглашениям, что и остальные поля форм (см.
 * IntakeForm.tsx inputClass/errors).
 */
export const LikertScale: React.FC<LikertScaleProps> = ({ min, max, value, onChange, minLabel, maxLabel, error }) => {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div>
      <div className={`flex flex-wrap gap-1.5 sm:gap-2 ${error ? '[&>button]:border-rose-300' : ''}`}>
        {values.map((v) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={active}
              className={`flex items-center justify-center min-w-[2.25rem] h-9 sm:h-10 sm:min-w-[2.5rem] px-2 rounded-lg border text-xs sm:text-sm font-semibold transition-colors ${
                active ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-700 border-sky-200 hover:border-brand-teal'
              }`}
            >
              {v}
            </button>
          );
        })}
      </div>
      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between mt-1.5 text-[10px] sm:text-xs text-slate-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
