import {
  computeIndices,
  bsa as bsaFormula,
  bodyFatNavy,
  bodyFatCategory,
  bmrHarrisBenedict,
  tdee as tdeeFormula,
  clamp,
  type Measurements,
  type BodyFatCategoryKey,
} from './formulas.js';
import { METRICS, inwellScore, bandFromScore, riskFromLevel } from './metricsRegistry.js';
import { buildGaugeSpec, type GaugeSpec } from './gauge.js';
import {
  percentileNormal,
  percentileFromSample,
  genderAgeReference,
  ageBandFor,
  symmetryPercentile,
  ASYMMETRY_REFERENCE,
  clampPct,
  RAW_METRICS,
} from './normsRegistry.js';
import { IMPORTANT_INFO_RU, CONFIDENTIALITY_RU, IMPORTANT_INFO_UZ, CONFIDENTIALITY_UZ } from './legalText.js';
import { METRIC_CONTENT, RAW_METRIC_CONTENT, BAND_LABEL, RISK_LABEL, BMI_CATEGORY, EXTRA_METRIC_CONTENT, BODY_FAT_CATEGORY } from './content.js';

export type Lang = 'ru' | 'uz';

/** Форма пиров/предыдущего замера, которая реально нужна расчёту — узкая
 * структурная копия FullReport, чтобы calc/ не зависел от db/ (без
 * циклического импорта: db/assessmentsRepo.ts импортирует FullReport
 * ОТСЮДА). Настоящие объекты из репозитория шире этой формы, поэтому
 * структурно подходят без явного приведения типов.
 *
 * Вложенные поля (bodyFat/symmetry/energy/...) объявлены optional — записи,
 * сохранённые ДО добавления бицепса/новой структуры симметрии, могут не
 * иметь этих полей в старом формате JSONB; весь код ниже читает их через
 * optional chaining, чтобы не падать на "исторических" записях. */
export interface PeerLike {
  measurements: Record<string, number>;
  results: {
    inwellScore: number;
    metrics: { key: string; value: number | null }[];
    bodyFat?: { value: number };
    symmetry?: { thigh?: { diffPct: number }; biceps?: { diffPct: number } };
  };
}

export interface PreviousLike {
  measurements: Record<string, number>;
  results: {
    metrics: { key: string; value: number | null }[];
    bodyFat?: { value: number };
    bsa?: { value: number };
    energy?: { bmr?: { value: number }; tdee?: { value: number } };
    symmetry?: { thigh?: { diffPct: number }; biceps?: { diffPct: number } };
    activityKey?: string;
  };
  createdAt: string;
}

export interface ReportInput extends Measurements {
  activityKey: string;
  /** Последние замеры других людей того же пола (без текущего) — источник
   * "перцентиль по базе Inwell" для inwellScore, сырых измерений, расчётных
   * показателей, % жира и симметрии. */
  peers?: PeerLike[];
  /** Предыдущий замер ЭТОГО ЖЕ человека (если телефон совпал с уже
   * существующим) — основа секции "Динамика". */
  previous?: PreviousLike | null;
}

export interface RawMeasurementResult {
  key: string;
  label: string;
  unit: string;
  value: number;
  /** Перцентиль относительно референсной популяции (нормальное приближение,
   * по полу И возрастной группе — см. FullReport.referenceAgeLabel). */
  genderPercentile: number | null;
  /** Перцентиль относительно накопленной базы Inwell того же пола (нужно n≥3). */
  inwellPercentile: number | null;
  populationRange: { mean: number; sd: number } | null;
}

export interface MetricResult {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  range: { min: number; max: number; text: string };
  score: number | null;
  band: { label: string; level: number };
  risk: { label: string; color: string };
  /** По dictionary — только у BMI/WHtR/WHR есть валидная категория риска;
   * у остальных (BAI/BRI/ABSI/AVI/CI/VAT) — false, и band/risk на отчёте
   * показывать нельзя, только значение + референс + перцентиль. */
  hasCategory: boolean;
  gauge: GaugeSpec;
  description: string;
  /** Короткое (1 предложение) объяснение для карточки — вместо длинного
   * description на самом отчёте (см. content.ts). */
  shortDescription: string;
  genderPercentile: number | null;
  inwellPercentile: number | null;
}

export interface BodyFatResult {
  label: string;
  value: number;
  unit: string;
  category: BodyFatCategoryKey;
  categoryLabel: string;
  referencePercentile: number | null;
  inwellPercentile: number | null;
  description: string;
  shortDescription: string;
}

export interface BsaResult {
  value: number;
  unit: string;
  description: string;
  shortDescription: string;
}

export interface EnergyValue {
  value: number;
  unit: string;
  description: string;
}

export interface EnergyResult {
  bmr: EnergyValue;
  tdee: EnergyValue;
}

/** Одна симметричная пара (бицепс ИЛИ бедро) — обе пары считаются одинаковой
 * логикой, см. implementation task п.6/7. */
export interface SymmetryPairResult {
  key: 'thigh' | 'biceps';
  unit: string;
  right: number;
  left: number;
  diffAbs: number;
  /** |right-left| / ((right+left)/2) * 100 */
  diffPct: number;
  /** Простой самореференсный балл симметрии: 100 - diffPct (0-100). Не
   * зависит от референсной популяции — просто "насколько close правая и
   * левая сторона друг к другу". */
  symmetryScore: number;
  largerSide: 'right' | 'left' | 'equal';
  /** Перцентиль СИММЕТРИЧНОСТИ относительно референсной популяции —
   * инвертированный (меньше асимметрия => выше перцентиль). null, если для
   * этой пары нет референса (не должно случаться — оба референса заданы). */
  referenceSymmetryPercentile: number | null;
  /** То же самое, но относительно базы Inwell (нужно n≥3 пиров с этой парой
   * измерений). */
  inwellSymmetryPercentile: number | null;
  /** Изменение diffPct с предыдущего замера, если есть. */
  progress: ProgressMetric | null;
}

export interface SymmetryResult {
  thigh: SymmetryPairResult;
  biceps: SymmetryPairResult;
}

export interface ProgressMetric {
  previous: number;
  current: number;
  delta: number;
  direction: 'up' | 'down' | 'flat';
  /** true для показателей в процентах (например, Body Fat %) — на отчёте
   * дельта должна подписываться "процентных пунктов", а не "%" (не путать
   * относительное изменение с изменением самого процентного значения). */
  isPercentagePoints?: boolean;
}

export interface ActivityProgress {
  previous: string;
  current: string;
  changed: boolean;
}

/** Динамика "было -> стало" — по ВСЕМ доступным показателям (сырые
 * измерения, расчётные метрики, % жира/BSA/BMR/TDEE, обе пары симметрии,
 * активность), не только вес/талия/BMI. Поле остаётся null для конкретного
 * показателя, если для него нет валидного предыдущего значения (например,
 * предыдущий замер был сделан до появления бицепса в форме) — это НЕ то же
 * самое, что isFirst=true (первый замер вообще), это точечный пробел в
 * старой записи. */
export interface ProgressResult {
  isFirst: boolean;
  previousDate: string | null;
  raw: Record<string, ProgressMetric | null>;
  metrics: Record<string, ProgressMetric | null>;
  bodyFat: ProgressMetric | null;
  bsa: ProgressMetric | null;
  bmr: ProgressMetric | null;
  tdee: ProgressMetric | null;
  activity: ActivityProgress | null;
}

export interface FullReport {
  measuredAt: string;
  age: number;
  gender: 'M' | 'F';
  activityKey: string;
  inwellScore: number;
  inwellScoreBand: { label: string; level: number };
  inwellScorePercentile: number | null;
  inwellScoreGauge: GaugeSpec;
  conclusion: string;
  /** "25–34" / "65+" и т.п. — возрастная группа, использованная для ВСЕХ
   * referencePercentile/genderPercentile в этом отчёте (см. implementation
   * task п.12: "Reference group: Men, 25–34"). Комбинируется на фронтенде с
   * локализованным полом ("Мужчины"/"Erkaklar"). */
  referenceAgeLabel: string;
  rawMeasurements: RawMeasurementResult[];
  metrics: MetricResult[];
  bodyFat: BodyFatResult;
  bsa: BsaResult;
  energy: EnergyResult;
  symmetry: SymmetryResult;
  progress: ProgressResult;
  importantInfo: string[];
  confidentiality: string[];
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function fmtNum(v: number, digits: number, lang: Lang): string {
  return v.toLocaleString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Перцентиль текущего значения относительно выборки пиров — нужно n≥3,
 * иначе слишком шумно (и это будет честно видно как null на фронте). */
function samplePercentile(value: number, peers: (number | null | undefined)[]): number | null {
  const sample = peers.filter((v): v is number => v != null && !Number.isNaN(v));
  return percentileFromSample(value, sample, 3)?.pct ?? null;
}

/** То же самое, что samplePercentile, но инвертированное (для перцентиля
 * СИММЕТРИЧНОСТИ по базе Inwell — меньше асимметрия => выше перцентиль). */
function invertedSamplePercentile(diffPct: number, peers: (number | null | undefined)[]): number | null {
  const sample = peers.filter((v): v is number => v != null && !Number.isNaN(v));
  const p = percentileFromSample(diffPct, sample, 3)?.pct ?? null;
  return p === null ? null : Math.round(clampPct(100 - p, 0.5, 99.5));
}

/** Число знаков после запятой, в которых показатель реально отображается на
 * отчёте (см. metricDigits() на фронтенде — та же таблица). Нужно, чтобы
 * округление и порог "было изменение / нет" в progressMetric() были
 * соразмерны масштабу конкретного показателя: у ABSI шаг в 0.05 (как для
 * кг/см) означал бы "всё плоско" почти всегда — при реальном диапазоне
 * значений ABSI в районе 0.07–0.09 такой порог просто никогда не сработает. */
function metricProgressDigits(key: string): number {
  if (key === 'whtr' || key === 'whr') return 2;
  if (key === 'absi') return 4;
  if (key === 'bmi') return 1;
  if (key === 'bai' || key === 'bri' || key === 'avi' || key === 'ci' || key === 'vat') return 2;
  return 2;
}

/** digits — сколько знаков после запятой реально показывает фронт для этого
 * показателя (см. metricProgressDigits()); округление дельты и порог
 * "flat vs up/down" вычисляются относительно этой точности, а не единого
 * порога в 0.05 — иначе показатели с малым масштабом значений (WHtR/WHR/
 * ABSI и т.п.) почти всегда получали бы direction:'flat' даже при заметном
 * относительно своего масштаба изменении. */
function progressMetric(previous: number | null | undefined, current: number, digits = 2, isPercentagePoints = false): ProgressMetric | null {
  if (previous == null || Number.isNaN(previous)) return null;
  const factor = Math.pow(10, digits);
  const delta = Math.round((current - previous) * factor) / factor;
  const threshold = 0.5 / factor;
  const direction: ProgressMetric['direction'] = delta > threshold ? 'up' : delta < -threshold ? 'down' : 'flat';
  return { previous, current, delta, direction, isPercentagePoints: isPercentagePoints || undefined };
}

function computeSymmetryPair(
  key: SymmetryPairResult['key'],
  right: number,
  left: number,
  unit: string,
  gender: 'M' | 'F',
  peerDiffPcts: (number | null | undefined)[],
  previousDiffPct: number | null | undefined,
): SymmetryPairResult {
  const diffAbs = round1(Math.abs(right - left));
  const avg = (right + left) / 2;
  const diffPct = avg ? round1((Math.abs(right - left) / avg) * 100) : 0;
  const largerSide: SymmetryPairResult['largerSide'] = right > left ? 'right' : left > right ? 'left' : 'equal';
  const symmetryScore = Math.round(clamp(100 - diffPct, 0, 100));
  const asymRef = ASYMMETRY_REFERENCE[key][gender];
  const referenceSymmetryPercentile = symmetryPercentile(diffPct, asymRef.mean, asymRef.sd);
  const inwellSymmetryPercentile = invertedSamplePercentile(diffPct, peerDiffPcts);
  const progress = previousDiffPct == null ? null : progressMetric(previousDiffPct, diffPct, 1);
  return { key, unit, right, left, diffAbs, diffPct, symmetryScore, largerSide, referenceSymmetryPercentile, inwellSymmetryPercentile, progress };
}

function computeProgress(
  input: ReportInput,
  indices: ReturnType<typeof computeIndices>,
  bodyFatValue: number,
  bsaValue: number,
  bmrValue: number,
  tdeeValue: number,
  previous: PreviousLike | null | undefined,
): ProgressResult {
  if (!previous) {
    return { isFirst: true, previousDate: null, raw: {}, metrics: {}, bodyFat: null, bsa: null, bmr: null, tdee: null, activity: null };
  }

  const currentRawValues: Record<string, number> = {
    height: input.height,
    weight: input.weight,
    waist: input.waist,
    hip: input.hip,
    chest: input.chest,
    neck: input.neck,
    bicepsR: input.bicepsR,
    bicepsL: input.bicepsL,
    thighR: input.thighR,
    thighL: input.thighL,
  };
  const raw: Record<string, ProgressMetric | null> = {};
  for (const rm of RAW_METRICS) {
    raw[rm.key] = progressMetric(previous.measurements?.[rm.key], currentRawValues[rm.key], 1);
  }

  const currentMetricValues: Record<string, number | null> = {
    bmi: indices.bmi,
    whtr: indices.whtr,
    whr: indices.whr,
    bai: indices.bai,
    bri: indices.bri,
    absi: indices.absi,
    ci: indices.ci,
    avi: indices.avi,
    vat: indices.vat,
  };
  const metrics: Record<string, ProgressMetric | null> = {};
  for (const m of METRICS) {
    const prevVal = previous.results.metrics?.find((pm) => pm.key === m.key)?.value;
    const curVal = currentMetricValues[m.key];
    metrics[m.key] = curVal == null ? null : progressMetric(prevVal, curVal, metricProgressDigits(m.key));
  }

  const bodyFat = progressMetric(previous.results.bodyFat?.value, bodyFatValue, 1, true);
  const bsa = progressMetric(previous.results.bsa?.value, bsaValue, 2);
  const bmr = progressMetric(previous.results.energy?.bmr?.value, bmrValue, 0);
  const tdee = progressMetric(previous.results.energy?.tdee?.value, tdeeValue, 0);

  const prevActivity = previous.results.activityKey;
  const activity: ActivityProgress | null = prevActivity ? { previous: prevActivity, current: input.activityKey, changed: prevActivity !== input.activityKey } : null;

  return { isFirst: false, previousDate: previous.createdAt, raw, metrics, bodyFat, bsa, bmr, tdee, activity };
}

function buildConclusion(
  lang: Lang,
  score: number,
  scorePercentile: number | null,
  weightPercentile: number | null,
  weight: number,
  bmiValue: number,
  bmiCategoryKey: string,
): string {
  const scoreWordRu =
    score >= 85 ? 'отличный результат' : score >= 70 ? 'хороший результат' : score >= 50 ? 'средний, в целом приемлемый результат' : score >= 30 ? 'результат ниже среднего' : 'результат, требующий внимания';
  const scoreWordUz =
    score >= 85 ? "aʼlo natija" : score >= 70 ? 'yaxshi natija' : score >= 50 ? "oʻrtacha, umuman qoniqarli natija" : score >= 30 ? "oʻrtachadan past natija" : "eʼtibor talab qiladigan natija";

  const bmiCategoryText = BMI_CATEGORY[lang][bmiCategoryKey];

  if (lang === 'ru') {
    const parts: string[] = [];
    parts.push(`Ваш общий балл Inwell Score составляет ${score} из максимально возможных 100 — это ${scoreWordRu}.`);
    if (scorePercentile !== null) {
      parts.push(`Это выше, чем у ${scorePercentile}% участников вашего пола в базе Inwell.`);
    }
    parts.push(`Индекс массы тела — ${fmtNum(bmiValue, 1, lang)} (категория: «${bmiCategoryText.toLowerCase()}»).`);
    if (weightPercentile !== null) {
      parts.push(`Масса тела ${fmtNum(weight, 1, lang)} кг выше, чем у ${weightPercentile}% людей вашего пола (по справочным популяционным ориентирам).`);
    }
    parts.push('Подробный разбор каждого показателя — ниже.');
    return parts.join(' ');
  }

  const parts: string[] = [];
  parts.push(`Sizning umumiy Inwell Score balingiz 100 balldan ${score} ni tashkil qiladi — bu ${scoreWordUz}.`);
  if (scorePercentile !== null) {
    parts.push(`Bu Inwell bazasidagi jinsingiz boʻyicha ishtirokchilarning ${scorePercentile}% idan yuqori.`);
  }
  parts.push(`Tana massa indeksi (BMI) — ${fmtNum(bmiValue, 1, lang)} (toifa: «${bmiCategoryText.toLowerCase()}»).`);
  if (weightPercentile !== null) {
    parts.push(`Tana vazningiz ${fmtNum(weight, 1, lang)} kg — jinsingiz boʻyicha odamlarning ${weightPercentile}% idan yuqori (umumiy populyatsion mezonlar boʻyicha).`);
  }
  parts.push("Har bir koʻrsatkichning batafsil tahlili quyida.");
  return parts.join(' ');
}

export function computeFullReport(input: ReportInput, lang: Lang = 'ru'): FullReport {
  const indices = computeIndices(input);
  const score = inwellScore(indices, input.gender, input.age);
  const scoreBandRaw = bandFromScore(score.total);
  const scoreBand = { label: BAND_LABEL[lang][scoreBandRaw.key], level: scoreBandRaw.level };

  const peers = input.peers ?? [];
  const scorePercentile = samplePercentile(score.total, peers.map((p) => p.results.inwellScore));

  const ageBand = ageBandFor(input.age);
  const weightRef = genderAgeReference('weight', input.gender, input.age);
  const weightPercentile = weightRef ? percentileNormal(input.weight, weightRef.mean, weightRef.sd) : null;

  const rawValues: Record<string, number> = {
    height: input.height,
    weight: input.weight,
    waist: input.waist,
    hip: input.hip,
    chest: input.chest,
    neck: input.neck,
    bicepsR: input.bicepsR,
    bicepsL: input.bicepsL,
    thighR: input.thighR,
    thighL: input.thighL,
  };

  const rawMeasurements: RawMeasurementResult[] = RAW_METRICS.map((rm) => {
    const value = rawValues[rm.key];
    const ref = genderAgeReference(rm.key, input.gender, input.age);
    const content = RAW_METRIC_CONTENT[lang][rm.key];
    return {
      key: rm.key,
      label: content.label,
      unit: content.unit,
      value,
      genderPercentile: ref ? percentileNormal(value, ref.mean, ref.sd) : null,
      inwellPercentile: samplePercentile(value, peers.map((p) => p.measurements[rm.key])),
      populationRange: ref ? { mean: ref.mean, sd: ref.sd } : null,
    };
  });

  const metrics: MetricResult[] = METRICS.map((m) => {
    const value = m.getValue(indices);
    const range = m.getRange(input.gender, input.age);
    const s = score.perMetric[m.key] ?? null;
    const bandRaw = bandFromScore(s);
    const band = { label: BAND_LABEL[lang][bandRaw.key], level: bandRaw.level };
    const riskRaw = riskFromLevel(bandRaw.level);
    const risk = { label: RISK_LABEL[lang][riskRaw.color], color: riskRaw.color };
    const content = METRIC_CONTENT[lang][m.key];
    const genderRef = genderAgeReference(m.key, input.gender, input.age);
    return {
      key: m.key,
      label: content.label,
      unit: content.unit,
      value,
      range,
      score: s,
      band,
      risk,
      hasCategory: m.hasCategory,
      gauge: buildGaugeSpec(value, range.min, range.max, m.gaugeType),
      description: content.description,
      shortDescription: content.shortDescription,
      genderPercentile: value !== null && genderRef ? percentileNormal(value, genderRef.mean, genderRef.sd) : null,
      inwellPercentile: value !== null ? samplePercentile(value, peers.map((p) => p.results.metrics.find((pm) => pm.key === m.key)?.value)) : null,
    };
  });

  // Body Fat % (US Navy) — не входит во взвешенный Inwell Score (та же
  // логика, что и раньше: score считается только по 9 "исходным" метрикам,
  // чтобы не задевать уже проверенные веса), но полноценно отображается в
  // отчёте с категорией/референсом/перцентилями. Это РАСЧЁТНАЯ оценка, не
  // измерение смарт-весами — формулировка в content.ts/i18n должна это
  // явно отражать (implementation task п.4).
  const bodyFatValue = round1(bodyFatNavy(input.gender, input.waist, input.neck, input.height, input.hip));
  const bodyFatCat = bodyFatCategory(input.gender, bodyFatValue);
  const bodyFatRef = genderAgeReference('bodyFat', input.gender, input.age);
  const bodyFatContent = EXTRA_METRIC_CONTENT[lang].bodyFat;
  const bodyFat: BodyFatResult = {
    label: bodyFatContent.label,
    value: bodyFatValue,
    unit: bodyFatContent.unit,
    category: bodyFatCat,
    categoryLabel: BODY_FAT_CATEGORY[lang][bodyFatCat],
    referencePercentile: bodyFatRef ? percentileNormal(bodyFatValue, bodyFatRef.mean, bodyFatRef.sd) : null,
    inwellPercentile: samplePercentile(bodyFatValue, peers.map((p) => p.results.bodyFat?.value)),
    description: bodyFatContent.description,
    shortDescription: bodyFatContent.shortDescription ?? bodyFatContent.description,
  };

  const bsaValue = round2(bsaFormula(input.weight, input.height));
  const bsaContent = EXTRA_METRIC_CONTENT[lang].bsa;
  const bsa: BsaResult = {
    value: bsaValue,
    unit: bsaContent.unit,
    description: bsaContent.description,
    shortDescription: bsaContent.shortDescription ?? bsaContent.description,
  };

  const bmrValue = Math.round(bmrHarrisBenedict(input.gender, input.weight, input.height, input.age));
  const tdeeValue = Math.round(tdeeFormula(bmrValue, input.activityKey));
  const bmrContent = EXTRA_METRIC_CONTENT[lang].bmr;
  const tdeeContent = EXTRA_METRIC_CONTENT[lang].tdee;
  const energy: EnergyResult = {
    bmr: { value: bmrValue, unit: bmrContent.unit, description: bmrContent.description },
    tdee: { value: tdeeValue, unit: tdeeContent.unit, description: tdeeContent.description },
  };

  const symmetry: SymmetryResult = {
    thigh: computeSymmetryPair(
      'thigh',
      input.thighR,
      input.thighL,
      RAW_METRIC_CONTENT[lang].thighR.unit,
      input.gender,
      peers.map((p) => p.results.symmetry?.thigh?.diffPct),
      input.previous?.results.symmetry?.thigh?.diffPct,
    ),
    biceps: computeSymmetryPair(
      'biceps',
      input.bicepsR,
      input.bicepsL,
      RAW_METRIC_CONTENT[lang].bicepsR.unit,
      input.gender,
      peers.map((p) => p.results.symmetry?.biceps?.diffPct),
      input.previous?.results.symmetry?.biceps?.diffPct,
    ),
  };

  const progress = computeProgress(input, indices, bodyFatValue, bsaValue, bmrValue, tdeeValue, input.previous);

  const conclusion = buildConclusion(lang, score.total, scorePercentile, weightPercentile, input.weight, indices.bmi, indices.bmiCategory);

  return {
    measuredAt: new Date().toISOString(),
    age: input.age,
    gender: input.gender,
    activityKey: input.activityKey,
    inwellScore: score.total,
    inwellScoreBand: scoreBand,
    inwellScorePercentile: scorePercentile,
    inwellScoreGauge: buildGaugeSpec(score.total, 50, 70, 'range'),
    conclusion,
    referenceAgeLabel: ageBand.label,
    rawMeasurements,
    metrics,
    bodyFat,
    bsa,
    energy,
    symmetry,
    progress,
    importantInfo: lang === 'uz' ? IMPORTANT_INFO_UZ : IMPORTANT_INFO_RU,
    confidentiality: lang === 'uz' ? CONFIDENTIALITY_UZ : CONFIDENTIALITY_RU,
  };
}
