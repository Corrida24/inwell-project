/**
 * Локализованные подписи/описания для расчётных и "сырых" показателей.
 * Вынесены отдельно от логики (metricsRegistry.ts / normsRegistry.ts),
 * чтобы бэкенд мог отдавать отчёт полностью на русском или на узбекском
 * в зависимости от lang, не дублируя формулы/веса/диапазоны.
 */
import type { MetricDefinition } from './metricsRegistry.js';
import type { RawMetricDef } from './normsRegistry.js';

export interface MetricContent {
  label: string;
  unit: string;
  description: string;
  /** Короткое (1 предложение) объяснение для обычного пользователя — используется
   * в карточке показателя вместо длинного description. Не медицинское заключение. */
  shortDescription: string;
}

export const METRIC_CONTENT: Record<'ru' | 'uz', Record<MetricDefinition['key'], MetricContent>> = {
  ru: {
    bmi: { label: 'BMI (индекс массы тела)', unit: '', description: 'Отношение веса к росту в квадрате. Простой и самый распространённый индикатор формы — но не различает мышцы и жир, поэтому у спортивных людей может быть завышен.', shortDescription: 'Соотношение веса и роста.' },
    whtr: { label: 'WHtR (талия / рост)', unit: '', description: 'Соотношение обхвата талии к росту. Считается одним из лучших простых индикаторов распределения жира в области живота — точнее BMI отражает форму тела.', shortDescription: 'Соотношение окружности талии и роста.' },
    whr: { label: 'WHR (талия / бёдра)', unit: '', description: 'Соотношение обхвата талии к обхвату бёдер. Показывает тип распределения жира — по типу "яблоко" (в районе живота) или "груша" (в районе бёдер).', shortDescription: 'Соотношение талии и бёдер.' },
    bai: { label: 'BAI (индекс адипозности тела)', unit: '', description: 'Оценивает долю жира в теле через обхват бёдер и рост, без необходимости взвешивания. Хорошо дополняет BMI, особенно там, где важна форма тела, а не только вес.', shortDescription: 'Оценка доли жира по бёдрам и росту, без веса.' },
    bri: { label: 'BRI (индекс округлости тела)', unit: '', description: 'Геометрическая модель формы тела на основе талии и роста. Чем ближе к 0, тем более вытянутая (узкая) форма тела; чем выше — тем более округлая.', shortDescription: 'Насколько округлая форма тела, по талии и росту.' },
    absi: { label: 'ABSI (индекс формы тела)', unit: '', description: 'Учитывает обхват талии относительно BMI и роста. Показывает риски, независимые от общей массы тела — то есть работает даже при нормальном BMI.', shortDescription: 'Форма тела независимо от общего веса.' },
    ci: { label: 'Индекс конусности (CI)', unit: '', description: 'Сравнивает форму тела с идеальным цилиндром. Значение ближе к 1.0 означает более "цилиндрическую" (равномерную) форму, значения выше — смещение массы к талии.', shortDescription: 'Насколько тело близко по форме к цилиндру.' },
    avi: { label: 'AVI (абдоминальный объёмный индекс)', unit: '', description: 'Оценивает объём в области живота на основе талии и бёдер. Дополняет WHtR и WHR ещё одним взглядом на распределение массы в центральной части тела.', shortDescription: 'Оценка объёма в области живота.' },
    vat: { label: 'Висцеральный жир (расчётная площадь)', unit: 'см²', description: 'Расчётная площадь жира вокруг внутренних органов. Эта форма жира энергетически наиболее активна и теснее всего связана с общим уровнем энергии и метаболической формой.', shortDescription: 'Расчётная площадь жира вокруг внутренних органов.' },
  },
  uz: {
    bmi: { label: 'BMI (tana massa indeksi)', unit: '', description: 'Vaznning boʻyning kvadratiga nisbati. Eng oddiy va keng tarqalgan shakl koʻrsatkichi — lekin mushak va yogʻni farqlamaydi, shuning uchun sportchilarda yuqori chiqishi mumkin.', shortDescription: 'Vazn va boʻy nisbati.' },
    whtr: { label: 'WHtR (bel / boʻy)', unit: '', description: 'Bel aylanasining boʻyga nisbati. Qorin sohasidagi yogʻ taqsimotining eng yaxshi oddiy koʻrsatkichlaridan biri — tana shaklini BMI dan aniqroq aks ettiradi.', shortDescription: 'Bel aylanasi va boʻy nisbati.' },
    whr: { label: 'WHR (bel / son)', unit: '', description: 'Bel aylanasining son aylanasiga nisbati. Yogʻ taqsimoti turini koʻrsatadi — "olma" turi (qorin atrofida) yoki "nok" turi (sonlar atrofida).', shortDescription: 'Bel va son aylanasi nisbati.' },
    bai: { label: 'BAI (tana yogʻlilik indeksi)', unit: '', description: 'Tortishdan foydalanmasdan, son aylanasi va boʻy orqali tanadagi yogʻ ulushini baholaydi. Tana shakli muhim boʻlgan hollarda BMI ni yaxshi toʻldiradi.', shortDescription: 'Son aylanasi va boʻy orqali yogʻ ulushi bahosi.' },
    bri: { label: 'BRI (tana dumaloqlik indeksi)', unit: '', description: 'Bel va boʻy asosidagi tana shaklining geometrik modeli. 0 ga qancha yaqin boʻlsa, tana shakli shuncha choʻzilgan (ingichka); qancha yuqori boʻlsa, shuncha dumaloq.', shortDescription: 'Tananing qanchalik dumaloq shaklda ekani.' },
    absi: { label: 'ABSI (tana shakli indeksi)', unit: '', description: 'BMI va boʻyga nisbatan bel aylanasini hisobga oladi. Umumiy tana vazniga bogʻliq boʻlmagan xavflarni koʻrsatadi — яъни BMI meʼyorida boʻlsa ham ishlaydi.', shortDescription: 'Umumiy vazndan mustaqil tana shakli.' },
    ci: { label: 'Konussimonlik indeksi (CI)', unit: '', description: 'Tana shaklini ideal silindr bilan solishtiradi. 1.0 ga yaqin qiymat — "silindrsimon" (bir tekis) shakl, yuqori qiymatlar — massaning bel tomon siljishi.', shortDescription: 'Tananing silindrga qanchalik yaqinligi.' },
    avi: { label: 'AVI (qorin hajmi indeksi)', unit: '', description: 'Bel va son asosida qorin sohasidagi hajmni baholaydi. WHtR va WHR ni tana markazidagi massa taqsimoti boʻyicha yana bir nuqtai nazar bilan toʻldiradi.', shortDescription: 'Qorin sohasidagi taxminiy hajm bahosi.' },
    vat: { label: 'Visseral yogʻ (hisoblangan maydon)', unit: 'sm²', description: 'Ichki organlar atrofidagi yogʻning hisoblangan maydoni. Bu yogʻ turi energetik jihatdan eng faol boʻlib, umumiy energiya darajasi va metabolik holat bilan eng chambarchas bogʻliq.', shortDescription: 'Ichki organlar atrofidagi hisoblangan yogʻ maydoni.' },
  },
};

export const RAW_METRIC_CONTENT: Record<'ru' | 'uz', Record<RawMetricDef['key'], { label: string; unit: string }>> = {
  ru: {
    height: { label: 'Рост', unit: 'см' },
    weight: { label: 'Вес тела', unit: 'кг' },
    waist: { label: 'Обхват талии', unit: 'см' },
    hip: { label: 'Обхват бёдер', unit: 'см' },
    chest: { label: 'Обхват груди', unit: 'см' },
    neck: { label: 'Обхват шеи', unit: 'см' },
    bicepsR: { label: 'Обхват правого бицепса', unit: 'см' },
    bicepsL: { label: 'Обхват левого бицепса', unit: 'см' },
    thighR: { label: 'Обхват правой ноги (бедра)', unit: 'см' },
    thighL: { label: 'Обхват левой ноги (бедра)', unit: 'см' },
  },
  uz: {
    height: { label: 'Boʻy', unit: 'sm' },
    weight: { label: 'Tana vazni', unit: 'kg' },
    waist: { label: 'Bel aylanasi', unit: 'sm' },
    hip: { label: 'Son aylanasi', unit: 'sm' },
    chest: { label: 'Koʻkrak aylanasi', unit: 'sm' },
    neck: { label: 'Boʻyin aylanasi', unit: 'sm' },
    bicepsR: { label: "Oʻng bilak (biceps) aylanasi", unit: 'sm' },
    bicepsL: { label: 'Chap bilak (biceps) aylanasi', unit: 'sm' },
    thighR: { label: "Oʻng oyoq (son) aylanasi", unit: 'sm' },
    thighL: { label: 'Chap oyoq (son) aylanasi', unit: 'sm' },
  },
};

export interface ExtraMetricContent {
  label: string;
  unit: string;
  description: string;
  shortDescription?: string;
}

/** Показатели, которые не входят во взвешенный Inwell Score (по dictionary
 * у них нет "good/bad" ярлыка) — BSA, Body Fat %, BMR, TDEE. */
export const EXTRA_METRIC_CONTENT: Record<'ru' | 'uz', { bodyFat: ExtraMetricContent; bsa: ExtraMetricContent; bmr: ExtraMetricContent; tdee: ExtraMetricContent }> = {
  ru: {
    bodyFat: {
      label: 'Расчётный процент жировой массы',
      unit: '%',
      description: 'Оценка доли жировой массы по методу US Navy — считается по обхватам шеи, талии (и бёдер у женщин), без смарт-весов и калипера. Это расчётная оценка, а не прямое измерение и не показания умных весов.',
      shortDescription: 'Расчётная доля жировой массы тела.',
    },
    bsa: {
      label: 'Площадь поверхности тела (BSA)',
      unit: 'м²',
      description: 'Оценочная площадь поверхности тела по формуле Дюбуа. Описательный показатель без оценки "хорошо/плохо" — используется как вспомогательный при расчёте базового обмена.',
      shortDescription: 'Оценочная площадь поверхности тела.',
    },
    bmr: {
      label: 'Базовый обмен (BMR)',
      unit: 'ккал/сутки',
      description: 'Оценка количества калорий, которые ваш организм расходует в состоянии полного покоя.',
    },
    tdee: {
      label: 'Суточный расход энергии (TDEE)',
      unit: 'ккал/сутки',
      description: 'Оценка суточного расхода энергии с учётом указанной вами частоты физической активности.',
    },
  },
  uz: {
    bodyFat: {
      label: 'Hisoblangan tanadagi yogʻ foizi',
      unit: '%',
      description: "US Navy usuli boʻyicha baholangan yogʻ ulushi — boʻyin, bel (ayollarda son ham) aylanalari boʻyicha hisoblanadi, smart-tarozi yoki kaliper kerak emas. Bu hisoblangan baho, toʻgʻridan-toʻgʻri oʻlchov yoki aqlli tarozi koʻrsatkichi emas.",
      shortDescription: 'Tanadagi hisoblangan yogʻ massasi ulushi.',
    },
    bsa: {
      label: 'Tana yuzasi maydoni (BSA)',
      unit: 'm²',
      description: "Dyubua formulasi boʻyicha baholangan tana yuzasi maydoni. \"Yaxshi/yomon\" bahosiz tavsifiy koʻrsatkich — asosiy almashinuvni hisoblashda yordamchi sifatida ishlatiladi.",
      shortDescription: 'Baholangan tana yuzasi maydoni.',
    },
    bmr: {
      label: 'Asosiy almashinuv (BMR)',
      unit: 'kkal/kun',
      description: 'Tanangiz toʻliq tinch holatda sarflaydigan taxminiy kaloriyalar soni.',
    },
    tdee: {
      label: 'Kunlik energiya sarfi (TDEE)',
      unit: 'kkal/kun',
      description: 'Siz koʻrsatgan jismoniy faollik chastotasini hisobga olgan holda kunlik energiya sarfi bahosi.',
    },
  },
};

export const BODY_FAT_CATEGORY: Record<'ru' | 'uz', Record<'essential' | 'athletes' | 'fitness' | 'average' | 'obese', string>> = {
  ru: {
    essential: 'Эссенциальный жир',
    athletes: 'Уровень атлета',
    fitness: 'Спортивная форма',
    average: 'Средний уровень',
    obese: 'Повышенный уровень',
  },
  uz: {
    essential: 'Zaruriy yogʻ',
    athletes: 'Sportchi darajasi',
    fitness: 'Sport formasi',
    average: "Oʻrtacha daraja",
    obese: 'Yuqori daraja',
  },
};

export const BAND_LABEL: Record<'ru' | 'uz', Record<string, string>> = {
  ru: { excellent: 'Отлично', good: 'Хорошо', normal: 'Норма', growth: 'Есть куда расти', attention: 'Требует внимания', dash: '—' },
  uz: { excellent: "Aʼlo", good: 'Yaxshi', normal: 'Meʼyor', growth: 'Oʻsish uchun joy bor', attention: "Eʼtibor talab qiladi", dash: '—' },
};

export const RISK_LABEL: Record<'ru' | 'uz', Record<'good' | 'warn' | 'danger', string>> = {
  ru: { good: 'Низкий риск', warn: 'Средний риск', danger: 'Повышенный риск' },
  uz: { good: 'Past xavf', warn: "Oʻrtacha xavf", danger: 'Yuqori xavf' },
};

export const BMI_CATEGORY: Record<'ru' | 'uz', Record<string, string>> = {
  ru: { underweight: 'Недостаточный вес', normal: 'Норма', overweight: 'Избыточный вес', obese: 'Ожирение' },
  uz: { underweight: 'Vazn yetishmovchiligi', normal: 'Meʼyor', overweight: 'Ortiqcha vazn', obese: 'Semizlik' },
};
