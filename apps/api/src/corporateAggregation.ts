import { METRICS } from './calc/metricsRegistry.js';
import { METRIC_CONTENT, BAND_LABEL, BODY_FAT_CATEGORY, EXTRA_METRIC_CONTENT } from './calc/content.js';
import type { Lang } from './calc/computeReport.js';
import { AGE_BANDS, ageBandFor, type AgeBandId } from './calc/normsRegistry.js';
import type { SafeResponseRow } from './db/responsesRepo.js';

/** См. metricsRegistry.ts bandFromScore() — тот же уровень 0-4, здесь просто
 * обратное отображение "уровень -> ключ формулировки", чтобы взять готовую
 * локализованную подпись из BAND_LABEL без пересчёта скора (он уже вычислен
 * и сохранён в каждом response.results на момент прохождения). */
const LEVEL_TO_BAND_KEY: Record<number, string> = { 4: 'excellent', 3: 'good', 2: 'normal', 1: 'growth', 0: 'attention' };

/** "% жировой массы" (US Navy) не входит в METRICS (взвешенный Inwell
 * Score), это отдельное поле FullReport.bodyFat — но по ТЗ должно быть
 * в корпоративном отчёте наравне с BMI/WHtR/... Обрабатывается тем же
 * способом (среднее + распределение по СУЩЕСТВУЮЩИМ категориям
 * BODY_FAT_CATEGORY), просто с отдельным ключом 'bodyFat', не из METRICS.
 */
const BODY_FAT_KEY = 'bodyFat';

export interface MetricAggregate {
  key: string;
  label: string;
  unit: string;
  hasCategory: boolean;
  average: number | null;
  distribution: { label: string; pct: number; level: number }[] | null;
}

export interface GroupAggregate {
  key: string;
  label: string;
  participantCount: number;
  averageScore: number | null;
  metrics: MetricAggregate[];
}

/** Один разрез состава участников (пол / возраст / отдел / город) — просто
 * count+pct по уже собранным полям, без каких-либо новых расчётов. */
export interface CompositionBreakdown {
  key: string;
  label: string;
  count: number;
  pct: number;
}

export interface Highlight {
  key: string;
  label: string;
  pct: number;
}

export interface AvailableFilters {
  departments: string[];
  genders: ('M' | 'F')[];
  regions: string[];
  ageBands: { id: AgeBandId; label: string }[];
  /** Нет такого поля в данных сотрудника (по ТЗ добавляли только "Отдел") —
   * список всегда пустой. Фильтр в UI показан как задел на будущее (см.
   * CorporateAuditResultsPage), а не как рабочая фильтрация. */
  offices: string[];
}

export interface AuditFilters {
  department?: string;
  gender?: 'M' | 'F';
  region?: string;
  ageBand?: string;
  office?: string;
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

function buildGroupAggregate(key: string, label: string, rows: SafeResponseRow[], lang: Lang): GroupAggregate {
  const metrics: MetricAggregate[] = METRICS.map((def) => {
    const content = METRIC_CONTENT[lang][def.key];
    const values: number[] = [];
    const levelCounts = new Map<number, number>();
    for (const row of rows) {
      const m = row.results.metrics.find((x) => x.key === def.key);
      if (!m || m.value == null) continue;
      values.push(m.value);
      if (def.hasCategory) {
        levelCounts.set(m.band.level, (levelCounts.get(m.band.level) ?? 0) + 1);
      }
    }
    let distribution: MetricAggregate['distribution'] = null;
    if (def.hasCategory && values.length > 0) {
      distribution = Array.from(levelCounts.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([level, count]) => ({
          level,
          label: BAND_LABEL[lang][LEVEL_TO_BAND_KEY[level] ?? 'attention'],
          pct: Math.round((count / values.length) * 100),
        }));
    }
    return { key: def.key, label: content.label, unit: content.unit, hasCategory: def.hasCategory, average: avg(values), distribution };
  });

  // % жировой массы — добавляется как ещё один "показатель" в ту же таблицу,
  // средним + распределением по существующим категориям (essential/athletes/
  // fitness/average/obese), без новой формулы.
  {
    const bfContent = EXTRA_METRIC_CONTENT[lang].bodyFat;
    const values: number[] = [];
    const catCounts = new Map<string, number>();
    for (const row of rows) {
      const bf = row.results.bodyFat;
      if (!bf) continue;
      values.push(bf.value);
      catCounts.set(bf.category, (catCounts.get(bf.category) ?? 0) + 1);
    }
    const distribution =
      values.length > 0
        ? Array.from(catCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => ({ level: 0, label: BODY_FAT_CATEGORY[lang][cat as keyof (typeof BODY_FAT_CATEGORY)['ru']], pct: Math.round((count / values.length) * 100) }))
        : null;
    metrics.push({ key: BODY_FAT_KEY, label: bfContent.label, unit: bfContent.unit, hasCategory: true, average: avg(values), distribution });
  }

  const scores = rows.map((r) => r.results.inwellScore).filter((v): v is number => v != null);

  return { key, label, participantCount: rows.length, averageScore: avg(scores), metrics };
}

function breakdown(rows: SafeResponseRow[], pick: (r: SafeResponseRow) => string, labelFor: (key: string) => string): CompositionBreakdown[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = pick(r);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, label: labelFor(key), count, pct: Math.round((count / total) * 100) }));
}

export interface Composition {
  gender: CompositionBreakdown[];
  ageBand: CompositionBreakdown[];
  department: CompositionBreakdown[];
  region: CompositionBreakdown[];
}

export interface AuditAggregation {
  participantCount: number;
  availableFilters: AvailableFilters;
  appliedFilters: AuditFilters;
  overall: GroupAggregate;
  composition: Composition;
  positiveHighlights: Highlight[];
  attentionHighlights: Highlight[];
  byDepartment: GroupAggregate[];
  byGender: GroupAggregate[];
  byAgeBand: GroupAggregate[];
}

/** "Основные положительные показатели" / "Основные зоны внимания" — простое
 * правило по уже посчитанным категориям (не новая медицинская логика):
 * категорийный показатель считается положительным, если доля "отлично"+
 * "хорошо" (level>=3) — большинство выборки, и зоной внимания, если доля
 * "рост"+"внимание" (level<=1) — большинство. Метрики без чёткого
 * большинства ни в один список не попадают. */
function buildHighlights(overall: GroupAggregate, lang: Lang): { positive: Highlight[]; attention: Highlight[] } {
  const positive: Highlight[] = [];
  const attention: Highlight[] = [];
  for (const m of overall.metrics) {
    if (!m.hasCategory || !m.distribution || m.distribution.length === 0) continue;
    if (m.key === BODY_FAT_KEY) continue; // категории % жира не сопоставимы по level с остальными — пропускаем из авто-выжимки
    const goodPct = m.distribution.filter((d) => d.level >= 3).reduce((a, d) => a + d.pct, 0);
    const attentionPct = m.distribution.filter((d) => d.level <= 1).reduce((a, d) => a + d.pct, 0);
    if (goodPct >= 50) positive.push({ key: m.key, label: m.label, pct: goodPct });
    else if (attentionPct >= 50) attention.push({ key: m.key, label: m.label, pct: attentionPct });
  }
  return { positive, attention };
}

/** Строит агрегированную (обезличенную) аналитику по ответам одного
 * аудита. Всё, что тут читается, — либо department/region/age/gender
 * (нужны только для группировки/фильтров, сами по себе не идентифицируют
 * человека в выборке 1-100 человек), либо results (уже посчитанный отчёт,
 * той же структуры, что у personal). respondent_id сюда даже не попадает —
 * его нет в SafeResponseRow (см. responsesRepo.ts). */
export function buildAuditAggregation(allRows: SafeResponseRow[], filters: AuditFilters, lang: Lang = 'ru'): AuditAggregation {
  const availableFilters: AvailableFilters = {
    departments: Array.from(new Set(allRows.map((r) => r.department).filter((d): d is string => !!d && d.trim() !== ''))).sort(),
    genders: Array.from(new Set(allRows.map((r) => r.gender))),
    regions: Array.from(new Set(allRows.map((r) => r.region))),
    ageBands: AGE_BANDS.map((b) => ({ id: b.id, label: b.label })).filter((b) => allRows.some((r) => ageBandFor(r.age).id === b.id)),
    offices: [],
  };

  const filtered = allRows.filter((r) => {
    if (filters.department && r.department !== filters.department) return false;
    if (filters.gender && r.gender !== filters.gender) return false;
    if (filters.region && r.region !== filters.region) return false;
    if (filters.ageBand && ageBandFor(r.age).id !== filters.ageBand) return false;
    // filters.office всегда игнорируется — такого поля нет в данных (см. AvailableFilters.offices).
    return true;
  });

  const overall = buildGroupAggregate('all', 'all', filtered, lang);
  const { positive, attention } = buildHighlights(overall, lang);

  const genderLabel = (g: string) => (g === 'M' ? (lang === 'uz' ? 'Erkaklar' : 'Мужчины') : lang === 'uz' ? 'Ayollar' : 'Женщины');

  const composition: Composition = {
    gender: breakdown(filtered, (r) => r.gender, genderLabel),
    ageBand: breakdown(filtered, (r) => ageBandFor(r.age).id, (id) => AGE_BANDS.find((b) => b.id === id)?.label ?? id),
    department: breakdown(filtered, (r) => r.department ?? '', (k) => k),
    region: breakdown(filtered, (r) => r.region, (k) => k),
  };

  const departments = Array.from(new Set(filtered.map((r) => r.department).filter((d): d is string => !!d && d.trim() !== ''))).sort();
  const byDepartment = departments.map((dep) => buildGroupAggregate(dep, dep, filtered.filter((r) => r.department === dep), lang));

  const genders = Array.from(new Set(filtered.map((r) => r.gender)));
  const byGender = genders.map((g) => buildGroupAggregate(g, genderLabel(g), filtered.filter((r) => r.gender === g), lang));

  const ageBandIds = Array.from(new Set(filtered.map((r) => ageBandFor(r.age).id)));
  const byAgeBand = AGE_BANDS.filter((b) => ageBandIds.includes(b.id)).map((b) => buildGroupAggregate(b.id, b.label, filtered.filter((r) => ageBandFor(r.age).id === b.id), lang));

  return {
    participantCount: filtered.length,
    availableFilters,
    appliedFilters: filters,
    overall,
    composition,
    positiveHighlights: positive,
    attentionHighlights: attention,
    byDepartment,
    byGender,
    byAgeBand,
  };
}
