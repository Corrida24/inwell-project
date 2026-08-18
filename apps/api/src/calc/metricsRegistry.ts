/**
 * Реестр расчётных показателей для отчёта "для людей" (веб-калькулятор).
 *
 * Порт js/metrics-registry.js — очки (0-100), веса и диапазоны нормы для
 * каждого показателя не менялись. Оставлены только 9 из 14 исходных
 * показателей — те, что считаются по чисто ручным измерениям (без
 * смарт-весов/калипера/динамометра): bmi, whtr, whr, bai, bri, absi, ci,
 * avi, vat. Итоговый Inwell Score — взвешенная сумма очков по этим 9
 * показателям; веса нормализуются на сумму используемых весов, как и в
 * оригинале, чтобы отсутствие каких-то данных не портило шкалу 0-100.
 *
 * Локализованные подписи/описания живут отдельно в calc/content.ts —
 * здесь только чистая математика, чтобы русская и узбекская версии отчёта
 * считались абсолютно одинаково.
 */
import { clamp, baiRangeFor, type ComputedIndices, type Gender } from './formulas.js';

export type GaugeType = 'range' | 'higherBetter' | 'lowerBetter';
export type BandKey = 'excellent' | 'good' | 'normal' | 'growth' | 'attention';

export interface MetricRange {
  min: number;
  max: number;
  text: string;
}

export interface MetricDefinition {
  key: 'bmi' | 'whtr' | 'whr' | 'bai' | 'bri' | 'absi' | 'ci' | 'avi' | 'vat';
  weight: number;
  gaugeType: GaugeType;
  /** По dictionary (02_Calculations, колонка "Risk / category"): только BMI,
   * WHtR и WHR имеют валидную категорию риска/здоровья. Остальные —
   * "reference-based only" (BAI/BRI/ABSI/AVI/CI) или "TBD" (VAT) — их
   * зона/скор используются только для внутреннего Inwell Score, а на
   * отчёте для человека цветной бейдж риска для них показывать нельзя. */
  hasCategory: boolean;
  getValue: (c: ComputedIndices) => number | null;
  getRange: (gender: Gender, age: number) => MetricRange;
  getScore: (c: ComputedIndices, gender: Gender, age: number) => number | null;
}

function rangeScore(v: number | null | undefined, goodMin: number, goodMax: number, padLow: number, padHigh: number): number | null {
  if (v == null || Number.isNaN(v)) return null;
  if (v >= goodMin && v <= goodMax) return 100;
  if (v < goodMin) {
    const floor = goodMin - padLow;
    return clamp(((v - floor) / (goodMin - floor)) * 100, 0, 100);
  }
  const ceil = goodMax + padHigh;
  return clamp(((ceil - v) / (ceil - goodMax)) * 100, 0, 100);
}

export function bandFromScore(score: number | null): { key: BandKey | 'dash'; level: 0 | 1 | 2 | 3 | 4 } {
  if (score === null) return { key: 'dash', level: 0 };
  if (score >= 85) return { key: 'excellent', level: 4 };
  if (score >= 70) return { key: 'good', level: 3 };
  if (score >= 50) return { key: 'normal', level: 2 };
  if (score >= 30) return { key: 'growth', level: 1 };
  return { key: 'attention', level: 0 };
}

export function riskFromLevel(level: number): { color: 'good' | 'warn' | 'danger' } {
  if (level >= 3) return { color: 'good' };
  if (level === 2) return { color: 'warn' };
  return { color: 'danger' };
}

export const METRICS: MetricDefinition[] = [
  {
    key: 'bmi', weight: 0.10, gaugeType: 'range', hasCategory: true,
    getValue: (c) => c.bmi,
    getRange: () => ({ min: 18.5, max: 25, text: '18.5 – 25' }),
    getScore: (c) => rangeScore(c.bmi, 18.5, 25, 7, 10),
  },
  {
    key: 'whtr', weight: 0.12, gaugeType: 'range', hasCategory: true,
    getValue: (c) => c.whtr,
    getRange: () => ({ min: 0.4, max: 0.5, text: '0.40 – 0.50' }),
    getScore: (c) => rangeScore(c.whtr, 0.4, 0.5, 0.1, 0.15),
  },
  {
    key: 'whr', weight: 0.08, gaugeType: 'range', hasCategory: true,
    getValue: (c) => c.whr,
    getRange: (g) => (g === 'M' ? { min: 0.7, max: 0.9, text: '0.70 – 0.90' } : { min: 0.65, max: 0.8, text: '0.65 – 0.80' }),
    getScore: (c, g) => (g === 'M' ? rangeScore(c.whr, 0.7, 0.9, 0.1, 0.1) : rangeScore(c.whr, 0.65, 0.8, 0.1, 0.1)),
  },
  {
    key: 'bai', weight: 0.07, gaugeType: 'range', hasCategory: false,
    getValue: (c) => c.bai,
    getRange: (g, age) => {
      const rg = baiRangeFor(g, age);
      return { min: rg.min, max: rg.max, text: `${rg.min} – ${rg.max}` };
    },
    getScore: (c, g, age) => {
      const rg = baiRangeFor(g, age);
      return rangeScore(c.bai, rg.min, rg.max, 6, 8);
    },
  },
  {
    key: 'bri', weight: 0.06, gaugeType: 'range', hasCategory: false,
    getValue: (c) => c.bri,
    getRange: () => ({ min: 1, max: 3.4, text: '1.0 – 3.4' }),
    getScore: (c) => rangeScore(c.bri, 1, 3.4, 1, 3.5),
  },
  {
    key: 'absi', weight: 0.04, gaugeType: 'range', hasCategory: false,
    getValue: (c) => c.absi,
    getRange: () => ({ min: 0.07, max: 0.086, text: '0.070 – 0.086' }),
    getScore: (c) => rangeScore(c.absi, 0.07, 0.086, 0.01, 0.01),
  },
  {
    key: 'ci', weight: 0.05, gaugeType: 'range', hasCategory: false,
    getValue: (c) => c.ci,
    getRange: () => ({ min: 1.0, max: 1.18, text: '1.00 – 1.18' }),
    getScore: (c) => rangeScore(c.ci, 1.0, 1.18, 0.05, 0.15),
  },
  {
    key: 'avi', weight: 0.05, gaugeType: 'range', hasCategory: false,
    getValue: (c) => c.avi,
    getRange: () => ({ min: 10, max: 16, text: '10 – 16' }),
    getScore: (c) => rangeScore(c.avi, 10, 16, 5, 8),
  },
  {
    key: 'vat', weight: 0.10, gaugeType: 'range', hasCategory: false,
    getValue: (c) => c.vat,
    getRange: () => ({ min: 0, max: 100, text: '0 – 100' }),
    getScore: (c) => rangeScore(c.vat, 0, 100, 30, 60),
  },
];

export interface ScoreResult {
  total: number;
  perMetric: Record<string, number | null>;
}

export function inwellScore(c: ComputedIndices, gender: Gender, age: number): ScoreResult {
  let total = 0;
  let usedWeight = 0;
  const perMetric: Record<string, number | null> = {};
  for (const m of METRICS) {
    const s = m.getScore(c, gender, age);
    perMetric[m.key] = s;
    if (s !== null && !Number.isNaN(s)) {
      total += s * m.weight;
      usedWeight += m.weight;
    }
  }
  const normalized = usedWeight > 0 ? total / usedWeight : 0;
  return { total: Math.round(clamp(normalized, 0, 100)), perMetric };
}
