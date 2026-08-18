/**
 * Формулы расчёта антропометрических показателей.
 *
 * Прямой порт js/calculations.js из исходного Fit Audit калькулятора —
 * численные значения формул НЕ менялись. Урезано до показателей, которые
 * можно посчитать по чисто ручным измерениям (сантиметровая лента, весы,
 * рост) — без смарт-весов (биоимпеданс), калипера и динамометра, которых
 * не будет у человека дома. Это осознанное решение (см. README проекта):
 * убраны % жировой массы, FMI, FFMI, метаболический возраст и ИФС —
 * их точный расчёт без соответствующих приборов невозможен.
 *
 * Единицы измерения на входе: height/waist/hip/chest/neck/thighCm — см;
 * weight — кг; age — лет.
 *
 * BSA, Body Fat % (US Navy), BMR (Harris-Benedict) и TDEE добавлены по
 * dictionary из Inwell_v1_Analytics_Dictionary.xlsx (лист 02_Calculations) —
 * это НЕ те же самые метрики, что были убраны выше: они считаются по
 * обхватам/весу/росту/возрасту/активности, без смарт-весов/калипера. Числа
 * и коэффициенты формул портированы 1:1 из fitaudit/js/calculations.js
 * (функции bsa, bodyFatNavy, bmrHarrisBenedict, tdee, ACTIVITY_MULTIPLIERS),
 * где они уже были реализованы для этого же продукта.
 */

export type Gender = 'M' | 'F';

export interface Measurements {
  gender: Gender;
  age: number;
  height: number; // см
  weight: number; // кг
  waist: number; // см
  hip: number; // см
  chest: number; // см
  neck: number; // см
  thighR: number; // см (обхват правой ноги/бедра)
  thighL: number; // см (обхват левой ноги/бедра)
  bicepsR: number; // см (обхват правого бицепса, в расслабленном состоянии)
  bicepsL: number; // см (обхват левого бицепса, в расслабленном состоянии)
}

function toMeters(cm: number): number {
  return cm / 100;
}

export function bmi(weightKg: number, heightCm: number): number {
  const h = toMeters(heightCm);
  return weightKg / (h * h);
}

export type BmiCategoryKey = 'underweight' | 'normal' | 'overweight' | 'obese';

/** Возвращает СТАБИЛЬНЫЙ КЛЮЧ категории (не локализованный текст) —
 * локализация делается в calc/content.ts по ключу + lang. */
export function bmiCategory(v: number): BmiCategoryKey {
  if (v < 18.5) return 'underweight';
  if (v < 25) return 'normal';
  if (v < 30) return 'overweight';
  return 'obese';
}

export function whtr(waistCm: number, heightCm: number): number {
  return waistCm / heightCm;
}

export function whr(waistCm: number, hipCm: number): number {
  return waistCm / hipCm;
}

// BAI = (обхват бёдер см / рост(м)^1.5) - 18
export function bai(hipCm: number, heightCm: number): number {
  const h = toMeters(heightCm);
  return hipCm / Math.pow(h, 1.5) - 18;
}

// Референсные диапазоны BAI по полу/возрасту (как в оригинале)
export function baiRangeFor(gender: Gender, age: number): { min: number; max: number } {
  let band: '20-39' | '40-59' | '60-79';
  if (age >= 20 && age <= 39) band = '20-39';
  else if (age >= 40 && age <= 59) band = '40-59';
  else if (age >= 60 && age <= 79) band = '60-79';
  else band = age < 20 ? '20-39' : '60-79';

  const table: Record<typeof band, Record<Gender, [number, number, number]>> = {
    '20-39': { M: [8, 21, 26], F: [21, 33, 39] },
    '40-59': { M: [11, 23, 29], F: [23, 35, 41] },
    '60-79': { M: [13, 25, 31], F: [25, 38, 43] },
  };
  const [under, healthy] = table[band][gender];
  return { min: under, max: healthy };
}

// BRI = 364.2 - 365.5 × sqrt(1 - (waist/(2π))^2 / (0.5×height)^2)
export function bri(waistCm: number, heightCm: number): number {
  const waistM = toMeters(waistCm);
  const heightM = toMeters(heightCm);
  const term = Math.pow(waistM / (2 * Math.PI), 2) / Math.pow(0.5 * heightM, 2);
  return 364.2 - 365.5 * Math.sqrt(Math.max(0, 1 - term));
}

// ABSI = WC(м) / (BMI^(2/3) × рост(м)^(1/2))
export function absi(waistCm: number, bmiValue: number, heightCm: number): number {
  const waistM = toMeters(waistCm);
  const heightM = toMeters(heightCm);
  return waistM / (Math.pow(bmiValue, 2 / 3) * Math.sqrt(heightM));
}

// AVI = [2×waist² + 0.7×(waist-hip)²] / 1000
export function avi(waistCm: number, hipCm: number): number {
  return (2 * Math.pow(waistCm, 2) + 0.7 * Math.pow(waistCm - hipCm, 2)) / 1000;
}

// CI = WC(м) / (0.109 × sqrt(BW(кг) / H(м)))
export function ci(waistCm: number, weightKg: number, heightCm: number): number {
  const waistM = toMeters(waistCm);
  const heightM = toMeters(heightCm);
  return waistM / (0.109 * Math.sqrt(weightKg / heightM));
}

// VAT — расчётная площадь висцерального жира (см²). Используется обхват
// ноги/бедра как "Proximal Thigh" (в оригинале — среднее правой/левой ляжки).
export function vat(gender: Gender, waistCm: number, thighCm: number, age: number, bmiValue: number): number {
  if (gender === 'M') {
    return 6 * waistCm - 4.41 * thighCm + 1.19 * age - 213.65;
  }
  return 2.15 * waistCm - 3.63 * thighCm + 1.46 * age + 6.22 * bmiValue - 92.713;
}

// BSA — площадь поверхности тела, формула Дюбуа: S = 0.007184 × W^0.425 × H^0.725
export function bsa(weightKg: number, heightCm: number): number {
  return 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
}

// Body Fat % — метод US Navy (обхваты, без калипера/весов с биоимпедансом).
export function bodyFatNavy(gender: Gender, waistCm: number, neckCm: number, heightCm: number, hipCm: number): number {
  if (gender === 'M') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  }
  return 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
}

export type BodyFatCategoryKey = 'essential' | 'athletes' | 'fitness' | 'average' | 'obese';

/** Категории % жира по стандарту ACE (American Council on Exercise) —
 * общепринятая опубликованная шкала, не собственное изобретение. */
export function bodyFatCategory(gender: Gender, bf: number): BodyFatCategoryKey {
  if (gender === 'M') {
    if (bf < 6) return 'essential';
    if (bf < 14) return 'athletes';
    if (bf < 18) return 'fitness';
    if (bf < 25) return 'average';
    return 'obese';
  }
  if (bf < 14) return 'essential';
  if (bf < 21) return 'athletes';
  if (bf < 25) return 'fitness';
  if (bf < 32) return 'average';
  return 'obese';
}

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, // нет / почти нет спорта
  light: 1.375, // 1-3 раза в неделю
  moderate: 1.55, // 3-5 раз в неделю
  heavy: 1.725, // 6-7 раз в неделю
  veryHeavy: 1.9, // дважды в день, тяжёлые тренировки
};

// BMR — базовый обмен, формула Харриса-Бенедикта (оригинальная, 1918/1984).
export function bmrHarrisBenedict(gender: Gender, weightKg: number, heightCm: number, age: number): number {
  if (gender === 'M') {
    return 66.5 + 13.75 * weightKg + 5.003 * heightCm - 6.775 * age;
  }
  return 655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * age;
}

// TDEE — суточный расход энергии = BMR × коэффициент активности.
export function tdee(bmrValue: number, activityKey: string): number {
  const mult = ACTIVITY_MULTIPLIERS[activityKey] ?? 1.2;
  return bmrValue * mult;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

export interface ComputedIndices {
  bmi: number;
  bmiCategory: BmiCategoryKey;
  whtr: number;
  whr: number;
  bai: number;
  bri: number;
  absi: number;
  avi: number;
  ci: number;
  vat: number;
}

export function computeIndices(m: Measurements): ComputedIndices {
  const bmiVal = bmi(m.weight, m.height);
  return {
    bmi: round2(bmiVal),
    bmiCategory: bmiCategory(bmiVal),
    whtr: round2(whtr(m.waist, m.height)),
    whr: round2(whr(m.waist, m.hip)),
    bai: round2(bai(m.hip, m.height)),
    bri: round2(bri(m.waist, m.height)),
    absi: round4(absi(m.waist, bmiVal, m.height)),
    avi: round2(avi(m.waist, m.hip)),
    ci: round2(ci(m.waist, m.weight, m.height)),
    vat: round1(vat(m.gender, m.waist, (m.thighR + m.thighL) / 2, m.age, bmiVal)),
  };
}
