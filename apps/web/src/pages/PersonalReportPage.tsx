import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, Minus, RotateCcw, Info, ShieldCheck, Activity, Flame, ChevronDown, ArrowLeft } from 'lucide-react';
import { useLanguage, fillTemplate } from '../i18n/LanguageContext';
import { Footer } from '../components/Footer';
import { ZoneGauge } from '../audit/ZoneGauge';
import { REPORT_STORAGE_KEY, REPORT_SOURCE_KEY, type ReportSource } from '../audit/reportStorage';
import type { SubmitResult } from '../audit/api';
import type { FullReport, GaugeSpec, MetricResult, ProgressMetric, RawMeasurementResult } from '../audit/types';

// ---------------------------------------------------------------------------
// DESIGN NOTE (redesign pass — see INWELL_PERSONAL_REPORT_REDESIGN.md):
// The previous version of this page repeated the same "card with a colour
// gradient percentile bar" pattern 20+ times, which read as a technical
// dashboard rather than a personal wellness profile. This version keeps
// every existing calculation/percentile/history value untouched, but:
//   - drops the repeating percentile gradient bar entirely (PercentileNote
//     below shows a number + one short sentence instead);
//   - keeps at most ONE small reference-range scale per metric card
//     (ZoneGauge, unchanged component) — that's a different thing from a
//     percentile bar and is allowed to stay;
//   - groups PRIMARY vs ADDITIONAL data, with additional/secondary detail
//     tucked behind a Collapsible instead of always-open giant sections;
//   - runs the whole report inside a ~1150px container instead of edge-to-
//     edge full-width blocks.
// ---------------------------------------------------------------------------

const RISK_COLOR: Record<string, string> = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
};

/** Mirrors the backend's riskFromLevel() thresholds (level>=3 good, ===2
 * warn, else danger) — same 0-4 band scale already used everywhere else in
 * this report, just applied here to the overall Inwell Score band, which
 * only carries {label, level} across the API boundary. Not a new scoring
 * rule — just reading the existing level with the existing thresholds. */
function riskColorForLevel(level: number): string {
  if (level >= 3) return RISK_COLOR.good;
  if (level === 2) return RISK_COLOR.warn;
  return RISK_COLOR.danger;
}

function fmt(v: number | null, digits = 1, lang = 'ru'): string {
  if (v === null || Number.isNaN(v)) return '—';
  return v.toLocaleString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Numeric DD.MM.YYYY rather than a localized month name — some browsers'
 * ICU data renders "uz-UZ" month names as raw tokens (e.g. "M08" instead of
 * "avgust"), so a numeric format is the reliable choice for both languages. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

/** По каждому расчётному показателю — количество знаков после запятой,
 * унаследовано из прежней вёрстки (не менялось при перестройке отчёта). */
function metricDigits(key: string): number {
  if (key === 'whtr' || key === 'whr') return 2;
  if (key === 'absi') return 4;
  if (key === 'bmi') return 1;
  return 2; // bai, bri, avi, ci, vat
}

/** Generic accordion — used everywhere secondary detail needs to stay
 * reachable without being on-screen by default (additional metrics, full
 * dynamics, score explanation). Plain useState, no external lib. */
const Collapsible: React.FC<{ openLabel: React.ReactNode; closeLabel: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }> = ({
  openLabel,
  closeLabel,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue-light py-2.5 rounded-lg hover:bg-sky-50/80 transition-colors"
      >
        <span className="inline-flex items-center gap-1.5">{open ? closeLabel : openLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

/** Reference-range visual scale: the good-range endpoints flank the gauge
 * bar directly. This is the ONE small colour scale a metric card is allowed
 * to keep (reference/medical zone) — it is NOT the percentile, which never
 * gets its own bar in this design (see PercentileNote). */
const RangeBar: React.FC<{ gauge: GaugeSpec; rangeMin: number; rangeMax: number; digits: number; lang: string; height?: number }> = ({
  gauge,
  rangeMin,
  rangeMax,
  digits,
  lang,
  height = 22,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-semibold text-slate-400 shrink-0 tabular-nums">{fmt(rangeMin, digits, lang)}</span>
    <div className="flex-1 min-w-0">
      <ZoneGauge gauge={gauge} height={height} />
    </div>
    <span className="text-[10px] font-semibold text-slate-400 shrink-0 tabular-nums">{fmt(rangeMax, digits, lang)}</span>
  </div>
);

/** Compact percentile presentation — replaces the old repeating colour
 * gradient bar entirely. Reference population is the primary line (number +
 * one human sentence); Inwell (when available) is a short secondary line in
 * violet, appended to the SAME block instead of a second stacked card, so
 * the two benchmarks stay visually distinct without doubling the layout.
 * Three variants let the same data read differently depending on how much
 * visual weight a section deserves (per redesign spec — "не повторяй одну и
 * ту же конструкцию 15 раз подряд"). */
const PercentileNote: React.FC<{
  genderPct: number | null;
  inwellPct: number | null;
  gender: 'M' | 'F';
  ageLabel: string;
  variant?: 'number' | 'badge' | 'text';
}> = ({ genderPct, inwellPct, gender, ageLabel, variant = 'number' }) => {
  const { t } = useLanguage();
  const r = t.audit.report;
  if (genderPct == null && inwellPct == null) {
    return <p className="text-xs text-slate-400">{r.notEnoughData}</p>;
  }
  const group = fillTemplate(r.referenceGroupWithAge, { sex: r.referenceGroupBySex[gender], age: ageLabel });
  const mainSentence = genderPct != null ? fillTemplate(r.percentileCompact, { pct: genderPct, group }) : null;
  const inwellSentence = inwellPct != null ? fillTemplate(r.inwellPercentileCompact, { pct: inwellPct }) : null;

  if (variant === 'badge') {
    return (
      <div className="flex items-start gap-2.5">
        {genderPct != null && (
          <span className="shrink-0 inline-flex items-center justify-center min-w-[2.5rem] h-8 px-1.5 rounded-full bg-sky-100 text-brand-blue text-sm font-extrabold tabular-nums">
            {genderPct}%
          </span>
        )}
        <p className="text-[11px] text-slate-500 leading-snug pt-1">
          {mainSentence}
          {inwellSentence && <span className="text-violet-600"> {inwellSentence}</span>}
        </p>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <p className="text-[11px] text-slate-500 leading-snug">
        {mainSentence}
        {inwellSentence && <span className="text-violet-600"> {inwellSentence}</span>}
      </p>
    );
  }

  // 'number' — biggest treatment, reserved for primary composition metrics.
  return (
    <div className="flex items-start gap-3">
      {genderPct != null && (
        <div className="shrink-0 text-center leading-none">
          <div className="text-2xl font-extrabold text-slate-900">{genderPct}</div>
          <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">{r.percentileLabel}</div>
        </div>
      )}
      <p className="text-xs text-slate-500 leading-snug pt-1">
        {mainSentence}
        {inwellSentence && (
          <>
            <br />
            <span className="text-violet-600">{inwellSentence}</span>
          </>
        )}
      </p>
    </div>
  );
};

/** Primary composition metric — BMI / Body Fat % / WHtR / WHR. The only 4
 * cards on the whole report that get the full treatment: big value +
 * category badge + one small reference scale + big-number percentile. */
const PrimaryMetricCard: React.FC<{
  label: string;
  value: string;
  unit: string;
  shortDescription: string;
  badgeLabel: string;
  badgeColor: string;
  gauge?: GaugeSpec;
  rangeMin?: number;
  rangeMax?: number;
  rangeDigits?: number;
  genderPct: number | null;
  inwellPct: number | null;
  gender: 'M' | 'F';
  ageLabel: string;
  lang: string;
}> = ({ label, value, unit, shortDescription, badgeLabel, badgeColor, gauge, rangeMin, rangeMax, rangeDigits = 1, genderPct, inwellPct, gender, ageLabel, lang }) => {
  const { t } = useLanguage();
  const r = t.audit.report;
  return (
    <div className="bg-white border border-sky-200 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <span className="text-sm font-bold text-slate-900">{label}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>{badgeLabel}</span>
      </div>
      <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1.5">
        {value}
        <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>
      </div>
      <p className="text-xs text-slate-500 mb-3">{shortDescription}</p>
      {gauge && rangeMin != null && rangeMax != null && (
        <>
          <RangeBar gauge={gauge} rangeMin={rangeMin} rangeMax={rangeMax} digits={rangeDigits} lang={lang} />
          <div className="text-[10px] text-slate-400 mt-1 mb-3">{r.referenceRangeLabel}</div>
        </>
      )}
      <div className={gauge ? '' : 'mt-3'}>
        <PercentileNote genderPct={genderPct} inwellPct={inwellPct} gender={gender} ageLabel={ageLabel} variant="number" />
      </div>
    </div>
  );
};

/** Secondary shape-index metric (BAI/BRI/ABSI/AVI/CI/VAT/BSA) — one
 * compact line for value, a thinner reference scale, and the plain 'text'
 * percentile variant. Lives inside the "additional metrics" Collapsible. */
const AdditionalMetricCard: React.FC<{ m: MetricResult; gender: 'M' | 'F'; ageLabel: string }> = ({ m, gender, ageLabel }) => {
  const { t, lang } = useLanguage();
  const r = t.audit.report;
  return (
    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5">
      <div className="flex items-baseline justify-between gap-2 mb-0.5">
        <span className="text-xs font-bold text-slate-700">{m.label}</span>
        <span className="text-sm font-bold text-slate-900">
          {fmt(m.value, metricDigits(m.key), lang)} <span className="text-[10px] font-medium text-slate-400">{m.unit}</span>
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mb-2">{m.shortDescription}</p>
      <RangeBar gauge={m.gauge} rangeMin={m.range.min} rangeMax={m.range.max} digits={metricDigits(m.key)} lang={lang} height={14} />
      <div className="mt-2">
        <PercentileNote genderPct={m.genderPercentile} inwellPct={m.inwellPercentile} gender={gender} ageLabel={ageLabel} variant="text" />
      </div>
    </div>
  );
};

const SimpleAdditionalCard: React.FC<{ title: string; value: string; unit: string; description: string }> = ({ title, value, unit, description }) => (
  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5">
    <div className="flex items-baseline justify-between gap-2 mb-0.5">
      <span className="text-xs font-bold text-slate-700">{title}</span>
      <span className="text-sm font-bold text-slate-900">
        {value} <span className="text-[10px] font-medium text-slate-400">{unit}</span>
      </span>
    </div>
    <p className="text-[11px] text-slate-500">{description}</p>
  </div>
);

/** Plain data field — no percentile, no evaluation. Used only in "Ваши
 * данные" (section 1), which is a pure snapshot of what the user entered. */
const DataField: React.FC<{ label: string; value: string; unit?: string; wide?: boolean }> = ({ label, value, unit, wide }) => (
  <div className={wide ? 'col-span-2' : ''}>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">{label}</div>
    <div className="text-base font-bold text-slate-900 leading-tight">
      {value}
      {unit && <span className="text-xs font-medium text-slate-400 ml-1">{unit}</span>}
    </div>
  </div>
);

// Нейтральный цвет для стрелки тренда: рост веса/талии — не всегда "плохо"
// (человек может набирать мышечную массу осознанно), поэтому не красим
// направление в красный/зелёный — только факт и величина изменения.
const TrendIcon: React.FC<{ direction: ProgressMetric['direction'] }> = ({ direction }) =>
  direction === 'up' ? <ArrowUp className="w-3.5 h-3.5 text-slate-500" /> : direction === 'down' ? <ArrowDown className="w-3.5 h-3.5 text-slate-500" /> : <Minus className="w-3.5 h-3.5 text-slate-400" />;

/** "Ваши измерения" tile — every raw measurement, compact grid, badge-style
 * percentile (no card-per-metric gradient bar), previous/change as one
 * small line instead of a bordered sub-block. */
const MeasurementTile: React.FC<{ rm: RawMeasurementResult; gender: 'M' | 'F'; ageLabel: string; progress: ProgressMetric | null }> = ({ rm, gender, ageLabel, progress }) => {
  const { t, lang } = useLanguage();
  const r = t.audit.report;
  return (
    <div className="bg-white border border-sky-200 rounded-xl p-3.5">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-slate-700">{rm.label}</span>
        <span className="text-lg font-extrabold text-slate-900">
          {fmt(rm.value, 1, lang)} <span className="text-[10px] font-medium text-slate-400">{rm.unit}</span>
        </span>
      </div>
      <PercentileNote genderPct={rm.genderPercentile} inwellPct={rm.inwellPercentile} gender={gender} ageLabel={ageLabel} variant="badge" />
      {progress && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-sky-100 mt-2.5 pt-2">
          <span>
            {fmt(progress.previous, 1, lang)} → {fmt(progress.current, 1, lang)} {rm.unit}
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-900 shrink-0 ml-2">
            <TrendIcon direction={progress.direction} />
            {fmt(Math.abs(progress.delta), 1, lang)} {rm.unit}
          </span>
        </div>
      )}
    </div>
  );
};

/** Section 4 — one symmetric pair (biceps OR thigh). Right/left proportional
 * bars stay (they're a comparison visual, not a repeating percentile bar),
 * MiniStat tiles for diff/diffPct/score, and a compact 'number'-variant
 * PercentileNote instead of the old stacked reference+Inwell blocks. */
const MiniStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-sky-50/60 border border-sky-100 rounded-lg px-2 py-2.5 text-center">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1 leading-tight">{label}</div>
    <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{value}</div>
  </div>
);

const SymmetryBlock: React.FC<{
  pairKey: 'thigh' | 'biceps';
  data: FullReport['symmetry']['thigh'];
  gender: 'M' | 'F';
  ageLabel: string;
}> = ({ pairKey, data, gender, ageLabel }) => {
  const { t, lang } = useLanguage();
  const r = t.audit.report;
  const s = r.symmetry;
  const pairCopy = s.pairs[pairKey];
  const max = Math.max(data.right, data.left, 1);

  return (
    <div className="bg-white border border-sky-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
      <h3 className="text-sm font-bold text-slate-900">{pairCopy.title}</h3>

      <div className="space-y-2.5">
        {(['right', 'left'] as const).map((side) => {
          const val = data[side];
          const pct = Math.max(4, (val / max) * 100);
          return (
            <div key={side} className="flex items-center gap-3">
              <span className="w-24 text-xs font-semibold text-slate-500 shrink-0">{side === 'right' ? pairCopy.right : pairCopy.left}</span>
              <div className="flex-1 h-2.5 rounded-full bg-sky-50 overflow-hidden">
                <div className="h-full rounded-full bg-brand-teal" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-16 text-right text-sm font-bold text-slate-900">
                {fmt(val, 1, lang)} {data.unit}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
        <MiniStat label={s.diffAbsLabel} value={`${fmt(data.diffAbs, 1, lang)} ${data.unit}`} />
        <MiniStat label={s.relDiffLabel} value={`${fmt(data.diffPct, 1, lang)}%`} />
        <MiniStat label={s.scoreLabel} value={fmt(data.symmetryScore, 0, lang)} />
      </div>

      <div className="border-t border-sky-100 pt-3">
        {data.referenceSymmetryPercentile != null ? (
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-xl font-extrabold text-slate-900 leading-none">
              {data.referenceSymmetryPercentile}
              <span className="text-[9px] font-semibold text-slate-400 ml-0.5">{r.percentileLabel}</span>
            </span>
            <p className="text-[11px] text-slate-500 pt-0.5">
              {fillTemplate(s.referencePercentileNote, {
                pct: data.referenceSymmetryPercentile,
                group: fillTemplate(r.referenceGroupWithAge, { sex: r.referenceGroupBySex[gender], age: ageLabel }),
              })}
              {data.inwellSymmetryPercentile != null && (
                <span className="text-violet-600"> {fillTemplate(s.inwellPercentileNote, { pct: data.inwellSymmetryPercentile })}</span>
              )}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400">{r.notEnoughData}</p>
        )}
      </div>

      {data.progress && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-sky-100 pt-3">
          <span>
            {s.progressLabel}: {fmt(data.progress.previous, 1, lang)}% → {fmt(data.progress.current, 1, lang)}%
            {data.progress.direction !== 'flat' && <span className="ml-1 text-slate-600">{data.progress.direction === 'down' ? s2Improved(t) : s2Worsened(t)}</span>}
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-900">
            <TrendIcon direction={data.progress.direction} />
            {fmt(Math.abs(data.progress.delta), 1, lang)} {r.progressPercentagePointsSuffix}
          </span>
        </div>
      )}
    </div>
  );
};

// diffPct going DOWN means symmetry improved (inverse relationship, same
// logic as referenceSymmetryPercentile — not re-derived, just phrased).
function s2Improved(t: ReturnType<typeof useLanguage>['t']) {
  return `· ${t.audit.report.symmetryImproved}`;
}
function s2Worsened(t: ReturnType<typeof useLanguage>['t']) {
  return `· ${t.audit.report.symmetryWorsened}`;
}

/** Tiny 2-point trend line — used ONLY for Weight and BMI, the two numbers
 * people actually track over time (per redesign spec — not a chart per
 * metric). */
const MiniSparkline: React.FC<{ previous: number; current: number; direction: ProgressMetric['direction'] }> = ({ previous, current, direction }) => {
  const min = Math.min(previous, current);
  const max = Math.max(previous, current);
  const span = max - min || 1;
  const y1 = 21 - ((previous - min) / span) * 16;
  const y2 = 21 - ((current - min) / span) * 16;
  const color = direction === 'down' ? '#0d9488' : direction === 'up' ? '#0f172a' : '#94a3b8';
  return (
    <svg width="36" height="24" viewBox="0 0 36 24" className="shrink-0" aria-hidden="true">
      <line x1="4" y1={y1} x2="32" y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy={y1} r="2.5" fill="#cbd5e1" />
      <circle cx="32" cy={y2} r="3" fill={color} />
    </svg>
  );
};

/** Section 6, top row — the handful of changes people actually care about
 * (Weight/Waist/BMI/Body Fat), shown big. Everything else lives inside the
 * "show full dynamics" Collapsible below. */
const PrimaryChangeTile: React.FC<{ label: string; metric: ProgressMetric; unit: string; digits?: number; sparkline?: boolean }> = ({
  label,
  metric,
  unit,
  digits = 1,
  sparkline = false,
}) => {
  const { t, lang } = useLanguage();
  const r = t.audit.report;
  const displayUnit = metric.isPercentagePoints ? r.progressPercentagePointsSuffix : unit;
  return (
    <div className="bg-white border border-sky-200 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
        {sparkline && <MiniSparkline previous={metric.previous} current={metric.current} direction={metric.direction} />}
      </div>
      <div className="text-sm text-slate-400 mb-0.5">
        {fmt(metric.previous, digits, lang)} → {fmt(metric.current, digits, lang)} {unit}
      </div>
      <div className="flex items-center gap-1.5 text-lg font-extrabold text-slate-900">
        <TrendIcon direction={metric.direction} />
        {fmt(Math.abs(metric.delta), digits, lang)} {displayUnit}
      </div>
    </div>
  );
};

/** Full dynamics — every remaining tracked value, unchanged compact
 * "prev → cur / delta" row. Lives inside the "show full dynamics"
 * Collapsible so the primary screen doesn't turn into 20 identical rows. */
const ProgressRow: React.FC<{ label: string; metric: ProgressMetric; unit: string; digits?: number }> = ({ label, metric, unit, digits = 1 }) => {
  const { t, lang } = useLanguage();
  const r = t.audit.report;
  const displayUnit = metric.isPercentagePoints ? r.progressPercentagePointsSuffix : unit;
  return (
    <div className="flex flex-wrap items-center justify-between bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 gap-x-3 gap-y-1">
      <span className="text-xs font-semibold text-slate-700 min-w-0">{label}</span>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <span className="text-slate-400 whitespace-nowrap">
          {fmt(metric.previous, digits, lang)} → {fmt(metric.current, digits, lang)} {unit}
        </span>
        <span className="flex items-center gap-1 font-bold text-slate-900 whitespace-nowrap">
          <TrendIcon direction={metric.direction} />
          {fmt(Math.abs(metric.delta), digits, lang)} {displayUnit}
        </span>
      </div>
    </div>
  );
};

export const PersonalReportPage: React.FC = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const r = t.audit.report;
  const [result, setResult] = useState<SubmitResult | null | undefined>(undefined);
  const [source, setSource] = useState<ReportSource>('personal');

  useEffect(() => {
    const raw = sessionStorage.getItem(REPORT_STORAGE_KEY);
    setResult(raw ? (JSON.parse(raw) as SubmitResult) : null);
    const src = sessionStorage.getItem(REPORT_SOURCE_KEY);
    setSource(src === 'corporate' ? 'corporate' : 'personal');
  }, []);
  const isCorporateSource = source === 'corporate';

  const activityLabel = useMemo(() => {
    const report = result?.report;
    if (!report) return '';
    return t.audit.form.fields.activity.options[report.activityKey];
  }, [result, t]);

  if (result === undefined) return null;

  if (!result) {
    return (
      <section className="pt-32 pb-20 text-center px-5">
        <p className="text-slate-600 mb-4">{r.empty}</p>
        <button
          onClick={() => navigate('/personal/start')}
          className="inline-flex px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-light transition-all"
        >
          {r.goToForm}
        </button>
      </section>
    );
  }

  const report: FullReport = result.report;
  const date = formatDate(report.measuredAt);
  const ageLabel = report.referenceAgeLabel;
  const rawByKey = (key: string) => report.rawMeasurements.find((m) => m.key === key);

  const bodyCompositionKeys = ['bmi', 'whtr', 'whr'];
  const bodyCompositionMetrics = report.metrics.filter((m) => bodyCompositionKeys.includes(m.key));
  const shapeIndexMetrics = report.metrics.filter((m) => !bodyCompositionKeys.includes(m.key));

  // Раздел 1 — "Ваши данные": буквально всё, что человек ввёл, без оценок.
  const DATA_FIELDS: { key: string; label: string; value: string; unit?: string }[] = [
    { key: 'gender', label: r.snapshotGender, value: report.gender === 'M' ? r.genderMale : r.genderFemale },
    { key: 'age', label: r.snapshotAge, value: String(report.age), unit: r.snapshotAgeUnit },
    ...['height', 'weight', 'waist', 'hip', 'chest', 'neck', 'bicepsR', 'bicepsL', 'thighR', 'thighL']
      .map((key) => rawByKey(key))
      .filter((rm): rm is RawMeasurementResult => !!rm)
      .map((rm) => ({ key: rm.key, label: rm.label, value: fmt(rm.value, 1, lang), unit: rm.unit })),
    { key: 'activity', label: r.snapshotActivity, value: activityLabel },
  ];

  // Раздел 3 — порядок карточек как в форме ввода.
  const RAW_ORDER = ['height', 'weight', 'waist', 'hip', 'chest', 'neck', 'bicepsR', 'bicepsL', 'thighR', 'thighL'];
  const orderedRaw = RAW_ORDER.map((key) => rawByKey(key)).filter((rm): rm is RawMeasurementResult => !!rm);

  // Раздел 6 — сгруппированная динамика по всем доступным показателям.
  const rawProgressEntries = RAW_ORDER.map((key) => ({ key, rm: rawByKey(key), metric: report.progress.raw[key] })).filter((e) => e.rm && e.metric);
  const METRIC_ORDER = ['bmi', 'whtr', 'whr', 'bai', 'bri', 'absi', 'avi', 'ci', 'vat'];
  const metricProgressEntries = METRIC_ORDER.map((key) => ({
    key,
    m: report.metrics.find((mm) => mm.key === key),
    metric: report.progress.metrics[key],
  })).filter((e) => e.m && e.metric);
  const hasAnyProgress =
    !report.progress.isFirst &&
    (rawProgressEntries.length > 0 ||
      metricProgressEntries.length > 0 ||
      report.progress.bodyFat ||
      report.progress.bsa ||
      report.progress.bmr ||
      report.progress.tdee ||
      report.symmetry.thigh.progress ||
      report.symmetry.biceps.progress ||
      report.progress.activity);

  // "Что изменилось" — только самые интересные 4 показателя наверху;
  // остальное — за "Показать всю динамику".
  const weightProgress = report.progress.raw['weight'];
  const waistProgress = report.progress.raw['waist'];
  const bmiProgress = report.progress.metrics['bmi'];
  const bodyFatProgress = report.progress.bodyFat;
  const weightRm = rawByKey('weight');
  const waistRm = rawByKey('waist');
  const bmiMetric = report.metrics.find((m) => m.key === 'bmi');

  return (
    <>
      <section className="pt-20 pb-10 sm:pt-32 sm:pb-20 bg-gradient-to-b from-sky-50 via-white to-teal-50/30">
        <div className="max-w-[1150px] mx-auto px-5 sm:px-8 space-y-6 sm:space-y-10">
          {!isCorporateSource && (
            <Link
              to="/personal"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t.common.back}</span>
            </Link>
          )}

          <div className="text-center space-y-1 sm:space-y-1.5">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900">{r.title}</h1>
            <p className={`text-xs font-medium ${isCorporateSource ? 'text-emerald-600' : result.trackable ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isCorporateSource ? t.corporate.publicAudit.submittedNote : result.trackable ? r.savedNote : r.notSavedNote}
            </p>
          </div>

          {/* HERO — Inwell Score, компактно */}
          <div className="bg-white border border-sky-200 rounded-3xl p-4 sm:p-7 max-w-2xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-baseline gap-1.5 shrink-0 justify-center sm:justify-start">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-none tabular-nums">{report.inwellScore}</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-brand-blue">{r.scoreLabel}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${riskColorForLevel(report.inwellScoreBand.level)}`}>{report.inwellScoreBand.label}</span>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">{r.scoreAdviceTitle} </span>
                  {report.inwellScoreBand.level >= 3 ? r.scoreAdviceGood : report.inwellScoreBand.level === 2 ? r.scoreAdviceMedium : r.scoreAdviceAttention}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-sky-100">
              <Collapsible openLabel={r.showScoreDetails} closeLabel={r.hideScoreDetails}>
                <p className="text-xs text-slate-500 leading-relaxed">{report.conclusion}</p>
              </Collapsible>
            </div>
          </div>

          {/* Раздел 1 — снимок данных (без сравнений и оценок) */}
          <div>
            <div className="flex items-baseline justify-between flex-wrap gap-1 mb-2.5 sm:mb-3">
              <h2 className="text-base font-bold text-slate-900">{fillTemplate(r.snapshotTitle, { date })}</h2>
              <span className="text-[11px] text-slate-400">{r.yourDataNote}</span>
            </div>
            <div className="bg-white border border-sky-200 rounded-2xl p-3.5 sm:p-5">
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-4">
                {DATA_FIELDS.map((f) => (
                  <DataField key={f.key} label={f.label} value={f.value} unit={f.unit} wide={f.key === 'activity'} />
                ))}
              </div>
            </div>
          </div>

          {/* Раздел 2 — композиция тела */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">{fillTemplate(r.compositionTitle, { date })}</h2>
            <p className="text-xs text-slate-500 mb-3 sm:mb-4">{r.compositionSubtitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mb-4 sm:mb-5">
              <PrimaryMetricCard
                label={report.bodyFat.label}
                value={fmt(report.bodyFat.value, 1, lang)}
                unit={report.bodyFat.unit}
                shortDescription={report.bodyFat.shortDescription}
                badgeLabel={report.bodyFat.categoryLabel}
                badgeColor="bg-sky-50 text-brand-blue border-sky-200"
                genderPct={report.bodyFat.referencePercentile}
                inwellPct={report.bodyFat.inwellPercentile}
                gender={report.gender}
                ageLabel={ageLabel}
                lang={lang}
              />
              {bodyCompositionMetrics.map((m) => (
                <PrimaryMetricCard
                  key={m.key}
                  label={m.label}
                  value={fmt(m.value, metricDigits(m.key), lang)}
                  unit={m.unit}
                  shortDescription={m.shortDescription}
                  badgeLabel={m.hasCategory ? m.band.label : r.categoryUnavailable}
                  badgeColor={m.hasCategory ? RISK_COLOR[m.risk.color] || '' : 'border-slate-200 text-slate-400'}
                  gauge={m.gauge}
                  rangeMin={m.range.min}
                  rangeMax={m.range.max}
                  rangeDigits={metricDigits(m.key)}
                  genderPct={m.genderPercentile}
                  inwellPct={m.inwellPercentile}
                  gender={report.gender}
                  ageLabel={ageLabel}
                  lang={lang}
                />
              ))}
            </div>

            <Collapsible openLabel={r.showAdditionalMetrics} closeLabel={r.hideAdditionalMetrics}>
              <p className="text-[11px] text-slate-400 mb-2.5 sm:mb-3">{r.shapeIndicesNote}</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                <SimpleAdditionalCard title={r.bsaCardTitle} value={fmt(report.bsa.value, 2, lang)} unit={report.bsa.unit} description={report.bsa.shortDescription} />
                {shapeIndexMetrics.map((m) => (
                  <AdditionalMetricCard key={m.key} m={m} gender={report.gender} ageLabel={ageLabel} />
                ))}
              </div>
            </Collapsible>
          </div>

          {/* Раздел 3 — все сырые измерения, с сравнением */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">{fillTemplate(r.measurementsTitle, { date })}</h2>
            <p className="text-xs text-slate-500 mb-3 sm:mb-4">{r.measurementsSubtitle}</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {orderedRaw.map((rm) => (
                <MeasurementTile key={rm.key} rm={rm} gender={report.gender} ageLabel={ageLabel} progress={report.progress.raw[rm.key] ?? null} />
              ))}
            </div>
          </div>

          {/* Раздел 4 — симметрия (бицепс + бедро) */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">{r.symmetry.sectionTitle}</h2>
            <p className="text-xs text-slate-500 mb-3 sm:mb-4">{r.symmetry.sectionSubtitle}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
              <SymmetryBlock pairKey="biceps" data={report.symmetry.biceps} gender={report.gender} ageLabel={ageLabel} />
              <SymmetryBlock pairKey="thigh" data={report.symmetry.thigh} gender={report.gender} ageLabel={ageLabel} />
            </div>
          </div>

          {/* Раздел 5 — активность и энергия (один компактный блок) */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2.5 sm:mb-3">{fillTemplate(r.activityEnergyTitle, { date })}</h2>
            <div className="bg-white border border-sky-200 rounded-2xl p-3.5 sm:p-5">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    <Activity className="w-3.5 h-3.5 text-brand-teal" />
                    {r.activityTitle}
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">{activityLabel}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    <Flame className="w-3.5 h-3.5 text-brand-teal" />
                    BMR
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    {report.energy.bmr.value} <span className="text-[10px] font-medium text-slate-400">{report.energy.bmr.unit}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    <Flame className="w-3.5 h-3.5 text-brand-teal" />
                    TDEE
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    {report.energy.tdee.value} <span className="text-[10px] font-medium text-slate-400">{report.energy.tdee.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Раздел 6 — динамика: главные изменения сразу, всё остальное — за collapsible */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3 sm:mb-4">{r.progressTitle}</h2>
            {report.progress.isFirst ? (
              <div className="bg-gradient-to-br from-sky-50 to-teal-50/60 border border-sky-200 rounded-2xl p-5 sm:p-6 text-center space-y-1.5 sm:space-y-2">
                <p className="text-base font-bold text-slate-900">{r.progressFirstTitle}</p>
                <p className="text-sm text-slate-600">{r.progressFirstText}</p>
              </div>
            ) : !hasAnyProgress ? (
              <div className="bg-gradient-to-br from-sky-50 to-teal-50/60 border border-sky-200 rounded-2xl p-5 sm:p-6 text-center space-y-1.5 sm:space-y-2">
                <p className="text-sm text-slate-600">{r.progressPartialNote}</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {report.progress.previousDate && <p className="text-xs text-slate-400">{fillTemplate(r.progressSince, { date: formatDate(report.progress.previousDate) })}</p>}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                  {weightProgress && weightRm && <PrimaryChangeTile label={weightRm.label} metric={weightProgress} unit={weightRm.unit} digits={1} sparkline />}
                  {waistProgress && waistRm && <PrimaryChangeTile label={waistRm.label} metric={waistProgress} unit={waistRm.unit} digits={1} />}
                  {bmiProgress && bmiMetric && <PrimaryChangeTile label={bmiMetric.label} metric={bmiProgress} unit="" digits={1} sparkline />}
                  {bodyFatProgress && <PrimaryChangeTile label={report.bodyFat.label} metric={bodyFatProgress} unit={report.bodyFat.unit} digits={1} />}
                </div>

                <Collapsible openLabel={r.showFullDynamics} closeLabel={r.hideFullDynamics}>
                  <div className="space-y-5">
                    {rawProgressEntries.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{r.progressGroupRaw}</h3>
                        <div className="space-y-1.5">
                          {rawProgressEntries.map(({ key, rm, metric }) => (
                            <ProgressRow key={key} label={rm!.label} metric={metric!} unit={rm!.unit} digits={1} />
                          ))}
                        </div>
                      </div>
                    )}

                    {(metricProgressEntries.length > 0 || report.progress.bodyFat || report.progress.bsa || report.progress.bmr || report.progress.tdee) && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{r.progressGroupMetrics}</h3>
                        <div className="space-y-1.5">
                          {metricProgressEntries.map(({ key, m, metric }) => (
                            <ProgressRow key={key} label={m!.label} metric={metric!} unit={m!.unit} digits={metricDigits(key)} />
                          ))}
                          {report.progress.bodyFat && <ProgressRow label={report.bodyFat.label} metric={report.progress.bodyFat} unit={report.bodyFat.unit} digits={1} />}
                          {report.progress.bsa && <ProgressRow label={r.bsaCardTitle} metric={report.progress.bsa} unit={report.bsa.unit} digits={2} />}
                          {report.progress.bmr && <ProgressRow label={r.progressBmrLabel} metric={report.progress.bmr} unit={report.energy.bmr.unit} digits={0} />}
                          {report.progress.tdee && <ProgressRow label={r.progressTdeeLabel} metric={report.progress.tdee} unit={report.energy.tdee.unit} digits={0} />}
                        </div>
                      </div>
                    )}

                    {(report.symmetry.thigh.progress || report.symmetry.biceps.progress) && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{r.progressGroupSymmetry}</h3>
                        <div className="space-y-1.5">
                          {report.symmetry.biceps.progress && (
                            <ProgressRow label={r.symmetry.pairs.biceps.title} metric={report.symmetry.biceps.progress} unit="%" digits={1} />
                          )}
                          {report.symmetry.thigh.progress && <ProgressRow label={r.symmetry.pairs.thigh.title} metric={report.symmetry.thigh.progress} unit="%" digits={1} />}
                        </div>
                      </div>
                    )}

                    {report.progress.activity && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{r.progressGroupActivity}</h3>
                        <div className="bg-white border border-sky-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700">
                          {report.progress.activity.changed
                            ? fillTemplate(r.progressActivityChanged, {
                                previous: t.audit.form.fields.activity.options[report.progress.activity.previous as keyof typeof t.audit.form.fields.activity.options],
                                current: t.audit.form.fields.activity.options[report.progress.activity.current as keyof typeof t.audit.form.fields.activity.options],
                              })
                            : fillTemplate(r.progressActivityUnchanged, {
                                current: t.audit.form.fields.activity.options[report.progress.activity.current as keyof typeof t.audit.form.fields.activity.options],
                              })}
                        </div>
                      </div>
                    )}

                    {(rawProgressEntries.length < RAW_ORDER.length || metricProgressEntries.length < METRIC_ORDER.length) && <p className="text-xs text-slate-400">{r.progressPartialNote}</p>}
                  </div>
                </Collapsible>
              </div>
            )}
          </div>

          {/* Важная информация */}
          <Collapsible
            openLabel={
              <>
                <Info className="w-4 h-4" /> {r.importantInfoTitle}
              </>
            }
            closeLabel={
              <>
                <Info className="w-4 h-4" /> {r.importantInfoTitle}
              </>
            }
            defaultOpen={false}
          >
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-7 space-y-2.5 sm:space-y-3">
              {report.importantInfo.map((p, i) => (
                <p key={i} className="text-xs text-slate-500 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Collapsible>

          {/* Конфиденциальность */}
          <Collapsible
            openLabel={
              <>
                <ShieldCheck className="w-4 h-4" /> {r.confidentialityTitle}
              </>
            }
            closeLabel={
              <>
                <ShieldCheck className="w-4 h-4" /> {r.confidentialityTitle}
              </>
            }
            defaultOpen={false}
          >
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-7 space-y-2">
              {report.confidentiality.map((p, i) => (
                <p key={i} className="text-xs text-slate-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Collapsible>

          {!isCorporateSource && (
            <button
              onClick={() => navigate('/personal/start')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-brand-blue bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{r.newAssessment}</span>
            </button>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};
