import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ReportView } from '../audit/ReportView';
import { EXAMPLE_REPORT_RU, EXAMPLE_REPORT_UZ, EXAMPLE_HISTORY } from '../audit/exampleReportData';
import type { SubmitResult } from '../audit/api';

// ---------------------------------------------------------------------------
// /example — статичный демо-отчёт БЕЗ подключения к базе данных (см. задачу
// пользователя: "точная копия страницы измерений, только без БД"). Данные —
// готовый FullReport, посчитанный настоящим движком computeFullReport() один
// раз заранее (см. apps/web/src/audit/exampleReportData.ts) и просто вбитый
// в код. Рендерит тот же <ReportView>, что и настоящий /personal/report,
// поэтому дизайн не может разойтись между "живым" и демо-отчётом.
// ---------------------------------------------------------------------------

function formatHistoryDate(iso: string, lang: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

const HistoryStrip: React.FC = () => {
  const { t, lang } = useLanguage();
  const r = t.audit.report;
  const max = Math.max(...EXAMPLE_HISTORY.map((p) => p.score));

  return (
    <div className="bg-white border border-sky-200 rounded-2xl p-4 sm:p-5 max-w-2xl mx-auto w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{r.historyTitle}</h3>
      <div className="flex items-end justify-between gap-3 sm:gap-6">
        {EXAMPLE_HISTORY.map((point, i) => {
          const heightPct = Math.max(18, (point.score / max) * 100);
          const isLast = i === EXAMPLE_HISTORY.length - 1;
          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-24 sm:h-28">
                <span className={`text-sm sm:text-base font-extrabold mb-1 ${isLast ? 'text-brand-blue' : 'text-slate-700'}`}>{point.score}</span>
                <div
                  className={`w-8 sm:w-10 rounded-t-lg ${isLast ? 'bg-brand-blue' : 'bg-sky-200'}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tabular-nums text-center">{formatHistoryDate(point.date, lang)}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-400 text-center mt-3">{r.historyCaption}</p>
    </div>
  );
};

export const ExampleReportPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const r = t.audit.report;
  const report = lang === 'uz' ? EXAMPLE_REPORT_UZ : EXAMPLE_REPORT_RU;
  const result: SubmitResult = { report, saved: true, trackable: true };

  return (
    <>
      <ReportView result={result} isCorporateSource={false} isExample historyStrip={<HistoryStrip />} />

      {/* Плавающая CTA-кнопка — всегда видна внизу по центру, ведёт на
         страницу заполнения формы. Это главный элемент /example: цель
         страницы — показать пример отчёта и сразу предложить пройти самому. */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <Link
          to="/personal/start"
          className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-bold text-white bg-brand-blue hover:bg-brand-blue-light shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
        >
          <span>{r.tryFloating}</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
};
