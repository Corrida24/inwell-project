import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Footer } from '../components/Footer';
import { ZoneGauge } from './ZoneGauge';
import type { QuestionnaireReport, GaugeSpec, QuestionnaireTestKey } from './types';

// ---------------------------------------------------------------------------
// Отчёт для 5 новых тестов (loyalty/burnout/turnover/wellbeing/psychSafety) —
// быстрый generic-шаблон: headline-балл (спидометр 0-100, тот же ZoneGauge,
// что и у фитнес-отчёта) + опциональные полосы подшкал (пока — только у
// теста на выгорание). Про "упростить формат фитнес-отчёта, чтобы стиль
// подходил всем результатам" — см. комментарий в ReportView.tsx: полное
// слияние в один компонент признано неоправданным риском для проверенного
// 800-строчного фитнес-отчёта, вместо этого ReportView просто делегирует
// сюда для нефитнес-тестов, так что у пользователя ОДИН и тот же
// компонент-точка входа (/personal/report), а внутри — общий генерик-стиль
// (спидометр + карточки), не фитнес-специфичная вёрстка.
// ---------------------------------------------------------------------------

const BAND_COLOR: Record<'low' | 'medium' | 'high', { positive: string; risk: string }> = {
  low: { positive: 'bg-rose-50 text-rose-700 border-rose-200', risk: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { positive: 'bg-amber-50 text-amber-700 border-amber-200', risk: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { positive: 'bg-emerald-50 text-emerald-700 border-emerald-200', risk: 'bg-rose-50 text-rose-700 border-rose-200' },
};

function badgeColorFor(band: 'low' | 'medium' | 'high', positiveDirection: boolean): string {
  return positiveDirection ? BAND_COLOR[band].positive : BAND_COLOR[band].risk;
}

function barColorFor(score: number): string {
  if (score >= 67) return '#10b981';
  if (score >= 34) return '#f59e0b';
  return '#ef4444';
}

function gaugeFor(headlineScore: number, positiveDirection: boolean): GaugeSpec {
  const zones = positiveDirection
    ? ([
        { from: 0, to: 34, color: 'red' },
        { from: 34, to: 67, color: 'amber' },
        { from: 67, to: 100, color: 'green' },
      ] as const)
    : ([
        { from: 0, to: 34, color: 'green' },
        { from: 34, to: 67, color: 'amber' },
        { from: 67, to: 100, color: 'red' },
      ] as const);
  return { domainMin: 0, domainMax: 100, zones: zones.map((z) => ({ ...z })), value: headlineScore };
}

export const GenericReportView: React.FC<{ report: QuestionnaireReport; testKey: QuestionnaireTestKey }> = ({ report, testKey }) => {
  const { t } = useLanguage();
  const test = t.tests[testKey];
  const isLoyalty = testKey === 'loyalty';
  const gauge = gaugeFor(report.headlineScore, report.positiveDirection);
  const bandLabel = t.tests.bandLabels[report.band];

  return (
    <>
      <section className="pt-20 pb-10 sm:pt-32 sm:pb-20 bg-gradient-to-b from-sky-50 via-white to-teal-50/30">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 space-y-6 sm:space-y-8">
          <div className="text-center space-y-1 sm:space-y-1.5">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900">{test.title}</h1>
            <p className="text-xs font-medium text-emerald-600">{t.corporate.publicAudit.submittedNote}</p>
          </div>

          {/* HERO — headline-балл, тот же спидометр, что и у фитнес-отчёта */}
          <div className="bg-white border border-sky-200 rounded-3xl p-4 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-baseline gap-1.5 shrink-0 justify-center sm:justify-start">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-none tabular-nums">
                  {isLoyalty ? Math.round(report.headlineScore / 10) : report.headlineScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">{isLoyalty ? '/ 10' : '/ 100'}</span>
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-brand-blue">{test.headlineLabel}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeColorFor(report.band, report.positiveDirection)}`}>{bandLabel}</span>
                </div>
                <ZoneGauge gauge={gauge} height={24} />
              </div>
            </div>
          </div>

          {/* Подшкалы (пока — только у теста на выгорание, 3 полосы) */}
          {report.subscales.length > 0 && (
            <div className="bg-white border border-sky-200 rounded-2xl p-4 sm:p-5 space-y-4">
              {report.subscales.map((s) => {
                const label = 'subscales' in test ? (test as { subscales: Record<string, string> }).subscales[s.key] ?? s.key : s.key;
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">{label}</span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{s.score}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: barColorFor(s.score) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-5">
            <p className="text-xs text-slate-600 leading-relaxed">{t.tests.confidentialityNote}</p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};
