/**
 * Централизованный реестр референсных данных ("reference population") для
 * consumer body-analytics отчёта — perцентильная математика (нормальное
 * распределение) + оценочные популяционные ориентиры по полу И возрастной
 * группе.
 *
 * ВАЖНО (см. Inwell Personal V1 implementation task, п.13/14): это
 * consumer wellness продукт, НЕ медицинский диагностический инструмент.
 * Референсные датасеты ниже — приближённые оценки на основе открытых
 * источников (агрегированные антропометрические данные взрослых), а НЕ
 * строгий валидированный клинический стандарт. Там, где нет отдельного
 * привязанного к возрасту исследования для конкретного показателя,
 * возрастная поправка построена как приближённый сдвиг среднего значения
 * относительно "якорной" возрастной группы 25–34, на основе общеизвестных
 * популяционных трендов (масса/талия растут с возрастом, обхват бедра и
 * бицепса — снижаются после ~40–45 и т.д.). Это явное, задокументированное
 * упрощение, а не выдуманные без основания цифры — стандартное отклонение
 * (sd) считается неизменным по возрастным группам.
 *
 * Каждый датасет ниже хранит source/population/sex/unit — централизованно,
 * а не разбросано по UI-компонентам (см. раздел REFERENCE_DATASETS).
 */
import type { Gender } from './formulas.js';

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

function normalCdf(x: number, mean: number, sd: number): number | null {
  if (!sd) return null;
  return 0.5 * (1 + erf((x - mean) / (sd * Math.SQRT2)));
}

export function clampPct(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Перцентиль значения относительно нормального распределения (0-100). */
export function percentileNormal(value: number | null | undefined, mean: number, sd: number): number | null {
  if (value == null || Number.isNaN(value) || !sd) return null;
  const cdf = normalCdf(value, mean, sd);
  if (cdf === null) return null;
  return Math.round(clampPct(cdf * 100, 0.5, 99.5));
}

/** Перцентиль значения относительно накопленной выборки (свои данные),
 * требуется минимум minN сопоставимых записей — иначе слишком шумно. */
export function percentileFromSample(value: number, sample: number[], minN = 3): { pct: number; n: number } | null {
  if (sample.length < minN) return null;
  const below = sample.filter((v) => v < value).length;
  const pct = Math.round(clampPct((below / sample.length) * 100, 0.5, 99.5));
  return { pct, n: sample.length };
}

// ---------------------------------------------------------------------------
// Возрастные группы
// ---------------------------------------------------------------------------

export type AgeBandId = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';

export const AGE_BANDS: { id: AgeBandId; min: number; max: number; label: string }[] = [
  { id: '18-24', min: 12, max: 24, label: '18–24' },
  { id: '25-34', min: 25, max: 34, label: '25–34' },
  { id: '35-44', min: 35, max: 44, label: '35–44' },
  { id: '45-54', min: 45, max: 54, label: '45–54' },
  { id: '55-64', min: 55, max: 64, label: '55–64' },
  { id: '65+', min: 65, max: 999, label: '65+' },
];

export function ageBandFor(age: number): (typeof AGE_BANDS)[number] {
  for (const band of AGE_BANDS) {
    if (age >= band.min && age <= band.max) return band;
  }
  return AGE_BANDS[1]; // 25-34 как разумный дефолт, не должно случаться при валидном age 12-99
}

// ---------------------------------------------------------------------------
// Референсные датасеты
// ---------------------------------------------------------------------------

interface SexAnchor {
  /** Среднее и стандартное отклонение для "якорной" возрастной группы 25–34. */
  mean: number;
  sd: number;
  /** Приближённый сдвиг среднего по возрастной группе относительно якоря
   * (та же единица, что и mean). Группы, не перечисленные явно, сдвига не
   * получают (используется анкорное значение). */
  ageDelta?: Partial<Record<AgeBandId, number>>;
}

export interface ReferenceDataset {
  metric: string;
  unit: string;
  /** Откуда взяты цифры — открытые источники, не проприетарный/закрытый датасет. */
  source: string;
  population: string;
  sexes: Record<Gender, SexAnchor>;
}

function ds(metric: string, unit: string, source: string, population: string, M: SexAnchor, F: SexAnchor): ReferenceDataset {
  return { metric, unit, source, population, sexes: { M, F } };
}

const OPEN_ANTHRO_SOURCE = 'Агрегированная оценка по открытым антропометрическим источникам (общие популяционные обзоры для взрослых); возрастная поправка — приближённый тренд, не отдельное исследование на каждую группу.';
const OPEN_ANTHRO_POPULATION = 'Взрослые (12–99 лет), общая популяция, без отбора по этнической группе или региону';

export const REFERENCE_DATASETS: Record<string, ReferenceDataset> = {
  height: ds('height', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 171, sd: 7, ageDelta: { '18-24': 0, '35-44': -0.5, '45-54': -1, '55-64': -2, '65+': -3.5 } },
    { mean: 159, sd: 7, ageDelta: { '18-24': 0, '35-44': -0.5, '45-54': -1, '55-64': -2, '65+': -3.5 } }),
  weight: ds('weight', 'кг', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 75, sd: 13, ageDelta: { '18-24': -2, '35-44': 2, '45-54': 3, '55-64': 2, '65+': 0 } },
    { mean: 65, sd: 14, ageDelta: { '18-24': -2, '35-44': 2, '45-54': 3, '55-64': 2, '65+': 0 } }),
  waist: ds('waist', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 90, sd: 11, ageDelta: { '18-24': -4, '35-44': 3, '45-54': 5, '55-64': 6, '65+': 6 } },
    { mean: 84, sd: 12, ageDelta: { '18-24': -4, '35-44': 3, '45-54': 5, '55-64': 6, '65+': 6 } }),
  hip: ds('hip', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 99, sd: 8, ageDelta: { '18-24': -1, '35-44': 1, '45-54': 1.5, '55-64': 1, '65+': 0 } },
    { mean: 101, sd: 9, ageDelta: { '18-24': -1, '35-44': 1, '45-54': 1.5, '55-64': 1, '65+': 0 } }),
  chest: ds('chest', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 99, sd: 8, ageDelta: { '18-24': -1, '35-44': 1, '45-54': 2, '55-64': 2, '65+': 1 } },
    { mean: 93, sd: 8, ageDelta: { '18-24': -1, '35-44': 1, '45-54': 2, '55-64': 2, '65+': 1 } }),
  neck: ds('neck', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 38, sd: 3, ageDelta: { '18-24': -0.5, '35-44': 0.5, '45-54': 0.5, '55-64': 0.5, '65+': 0.5 } },
    { mean: 33, sd: 2.5, ageDelta: { '18-24': -0.5, '35-44': 0.5, '45-54': 0.5, '55-64': 0.5, '65+': 0.5 } }),
  thighR: ds('thighR', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 55, sd: 6, ageDelta: { '18-24': -1, '45-54': -0.5, '55-64': -1, '65+': -1.5 } },
    { mean: 56, sd: 7, ageDelta: { '18-24': -1, '45-54': -0.5, '55-64': -1, '65+': -1.5 } }),
  thighL: ds('thighL', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 55, sd: 6, ageDelta: { '18-24': -1, '45-54': -0.5, '55-64': -1, '65+': -1.5 } },
    { mean: 56, sd: 7, ageDelta: { '18-24': -1, '45-54': -0.5, '55-64': -1, '65+': -1.5 } }),
  bicepsR: ds('bicepsR', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 33, sd: 3.5, ageDelta: { '18-24': -1, '35-44': -0.3, '45-54': -0.8, '55-64': -1.5, '65+': -2.5 } },
    { mean: 28, sd: 3, ageDelta: { '18-24': -1, '35-44': -0.3, '45-54': -0.8, '55-64': -1.5, '65+': -2.5 } }),
  bicepsL: ds('bicepsL', 'см', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 33, sd: 3.5, ageDelta: { '18-24': -1, '35-44': -0.3, '45-54': -0.8, '55-64': -1.5, '65+': -2.5 } },
    { mean: 28, sd: 3, ageDelta: { '18-24': -1, '35-44': -0.3, '45-54': -0.8, '55-64': -1.5, '65+': -2.5 } }),
  bodyFat: ds('bodyFat', '%', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 22, sd: 7, ageDelta: { '18-24': -3, '35-44': 2, '45-54': 3.5, '55-64': 4.5, '65+': 5 } },
    { mean: 32, sd: 8, ageDelta: { '18-24': -3, '35-44': 2, '45-54': 3.5, '55-64': 4.5, '65+': 5 } }),

  // Расчётные показатели — якорь центрирован чуть выше "хорошего" диапазона
  // геджа (metricsRegistry.ts), отражая типичное смещение общей популяции
  // выше идеальных значений; возрастная поправка — тот же приближённый
  // тренд роста центрального ожирения с возрастом.
  bmi: ds('bmi', 'кг/м²', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 24.5, sd: 3.8, ageDelta: { '18-24': -1.2, '35-44': 0.8, '45-54': 1.3, '55-64': 1.2, '65+': 0.6 } },
    { mean: 23.8, sd: 4.2, ageDelta: { '18-24': -1.2, '35-44': 0.8, '45-54': 1.3, '55-64': 1.2, '65+': 0.6 } }),
  whtr: ds('whtr', 'коэфф.', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 0.49, sd: 0.06, ageDelta: { '18-24': -0.03, '35-44': 0.02, '45-54': 0.03, '55-64': 0.04, '65+': 0.05 } },
    { mean: 0.46, sd: 0.06, ageDelta: { '18-24': -0.03, '35-44': 0.02, '45-54': 0.03, '55-64': 0.04, '65+': 0.05 } }),
  whr: ds('whr', 'коэфф.', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 0.85, sd: 0.07, ageDelta: { '18-24': -0.02, '35-44': 0.02, '45-54': 0.03, '55-64': 0.03, '65+': 0.03 } },
    { mean: 0.78, sd: 0.06, ageDelta: { '18-24': -0.02, '35-44': 0.02, '45-54': 0.03, '55-64': 0.03, '65+': 0.03 } }),
  bai: ds('bai', '%', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 21, sd: 4, ageDelta: { '18-24': -2, '35-44': 1.5, '45-54': 2.5, '55-64': 3, '65+': 3 } },
    { mean: 33, sd: 5, ageDelta: { '18-24': -2, '35-44': 1.5, '45-54': 2.5, '55-64': 3, '65+': 3 } }),
  bri: ds('bri', 'индекс', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 3.8, sd: 1.5, ageDelta: { '18-24': -0.3, '35-44': 0.3, '45-54': 0.5, '55-64': 0.6, '65+': 0.6 } },
    { mean: 4.2, sd: 1.6, ageDelta: { '18-24': -0.3, '35-44': 0.3, '45-54': 0.5, '55-64': 0.6, '65+': 0.6 } }),
  absi: ds('absi', 'индекс', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 0.079, sd: 0.006, ageDelta: { '18-24': -0.002, '35-44': 0.001, '45-54': 0.002, '55-64': 0.002, '65+': 0.002 } },
    { mean: 0.077, sd: 0.006, ageDelta: { '18-24': -0.002, '35-44': 0.001, '45-54': 0.002, '55-64': 0.002, '65+': 0.002 } }),
  ci: ds('ci', 'индекс', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 1.25, sd: 0.09, ageDelta: { '18-24': -0.02, '35-44': 0.02, '45-54': 0.03, '55-64': 0.03, '65+': 0.03 } },
    { mean: 1.18, sd: 0.08, ageDelta: { '18-24': -0.02, '35-44': 0.02, '45-54': 0.03, '55-64': 0.03, '65+': 0.03 } }),
  avi: ds('avi', 'индекс', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 17, sd: 4, ageDelta: { '18-24': -1, '35-44': 1, '45-54': 1.5, '55-64': 2, '65+': 2 } },
    { mean: 15, sd: 4, ageDelta: { '18-24': -1, '35-44': 1, '45-54': 1.5, '55-64': 2, '65+': 2 } }),
  vat: ds('vat', 'см²', OPEN_ANTHRO_SOURCE, OPEN_ANTHRO_POPULATION,
    { mean: 110, sd: 45, ageDelta: { '18-24': -15, '35-44': 15, '45-54': 25, '55-64': 30, '65+': 30 } },
    { mean: 90, sd: 40, ageDelta: { '18-24': -15, '35-44': 15, '45-54': 25, '55-64': 30, '65+': 30 } }),
};

export interface AgeAdjustedReference {
  mean: number;
  sd: number;
  ageBandId: AgeBandId;
  ageLabel: string;
  source: string;
  population: string;
}

/** Референс по полу И возрастной группе — используется для perцентиля
 * "относительно референсной популяции" для сырых измерений и расчётных
 * показателей (см. implementation task п.12/14: genderPercentile больше не
 * должен быть структурно null для расчётных метрик). */
export function genderAgeReference(metric: string, gender: Gender, age: number): AgeAdjustedReference | null {
  const dataset = REFERENCE_DATASETS[metric];
  if (!dataset) return null;
  const anchor = dataset.sexes[gender];
  const band = ageBandFor(age);
  const delta = anchor.ageDelta?.[band.id] ?? 0;
  return {
    mean: anchor.mean + delta,
    sd: anchor.sd,
    ageBandId: band.id,
    ageLabel: band.label,
    source: dataset.source,
    population: dataset.population,
  };
}

/** Обратная совместимость: перцентиль/среднее без учёта возраста (не
 * используется в computeReport.ts после перехода на genderAgeReference, но
 * оставлен как более простой публичный хелпер на случай точечного
 * использования). */
export function genderReference(field: string, gender: Gender): { mean: number; sd: number } | null {
  const dataset = REFERENCE_DATASETS[field];
  if (!dataset) return null;
  const anchor = dataset.sexes[gender];
  return { mean: anchor.mean, sd: anchor.sd };
}

// ---------------------------------------------------------------------------
// Сырые измерения — порядок вывода в отчёте
// ---------------------------------------------------------------------------

export interface RawMetricDef {
  key: 'height' | 'weight' | 'waist' | 'hip' | 'chest' | 'neck' | 'bicepsR' | 'bicepsL' | 'thighR' | 'thighL';
  digits: number;
}

// Подписи/единицы измерения локализованы отдельно — см. calc/content.ts (RAW_METRIC_CONTENT).
export const RAW_METRICS: RawMetricDef[] = [
  { key: 'height', digits: 1 },
  { key: 'weight', digits: 1 },
  { key: 'waist', digits: 1 },
  { key: 'hip', digits: 1 },
  { key: 'chest', digits: 1 },
  { key: 'neck', digits: 1 },
  { key: 'bicepsR', digits: 1 },
  { key: 'bicepsL', digits: 1 },
  { key: 'thighR', digits: 1 },
  { key: 'thighL', digits: 1 },
];

// ---------------------------------------------------------------------------
// Симметрия — референс "типичной" асимметрии в популяции (по полу)
// ---------------------------------------------------------------------------

/** Насколько сильно у типичного человека отличаются правая/левая сторона,
 * в % (см. computeSymmetry.diffPct). Approximate — открытых источников по
 * билатеральной асимметрии обхватов немного, поэтому это осторожная,
 * консервативная оценка (не строгий стандарт), см. implementation task п.13. */
export const ASYMMETRY_REFERENCE: Record<'thigh' | 'biceps', Record<Gender, { mean: number; sd: number }>> = {
  thigh: {
    M: { mean: 3, sd: 2 },
    F: { mean: 3, sd: 2 },
  },
  biceps: {
    // Обхват руки чаще заметно асимметричен из-за ведущей руки — референс
    // немного выше, чем для бедра.
    M: { mean: 4, sd: 2.5 },
    F: { mean: 4, sd: 2.5 },
  },
};

/** Перцентиль СИММЕТРИЧНОСТИ (не асимметрии!) — инвертированный: чем МЕНЬШЕ
 * относительная разница между сторонами, тем ВЫШЕ этот перцентиль. Если
 * perцентиль асимметрии (diffPct) относительно референса равен P (P% людей
 * имеют diffPct меньше вашего — то есть более симметричны, чем вы), то доля
 * людей с БОЛЬШЕЙ асимметрией, чем у вас (то есть менее симметричных) —
 * (100 - P). Именно её и показываем как "вы симметричнее, чем X% людей". */
export function symmetryPercentile(diffPct: number, mean: number, sd: number): number | null {
  const p = percentileNormal(diffPct, mean, sd);
  if (p === null) return null;
  return Math.round(clampPct(100 - p, 0.5, 99.5));
}
