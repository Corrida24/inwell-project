import { describe, it, expect } from 'vitest';
import { buildLoyaltyMetric, buildQuestionnaireGroupAggregate, buildAuditAggregation } from './corporateAggregation.js';
import type { QuestionnaireReport } from './calc/questionnaire/computeQuestionnaireReport.js';
import type { FullReport } from './calc/computeReport.js';
import type { SafeResponseRow } from './db/responsesRepo.js';

/** Минимальная fitness-строка для банding-тестов ниже -- buildFitnessGroupAggregate
 * реально читает только results.inwellScore/metrics/bodyFat, поэтому остальные
 * (обязательные по типу FullReport, но не используемые этим кодом) поля не
 * заполняем -- как и loyaltyRow/wellbeingRow ниже, это намеренно неполный
 * fixture, а не случайный пробел. */
function fitnessRowWithScore(inwellScore: number, createdAt: Date = new Date('2026-01-01T00:00:00Z')): SafeResponseRow & { results: FullReport } {
  return {
    department: 'it',
    region: 'tashkent_city',
    age: 30,
    gender: 'M',
    activityKey: 'moderate',
    answers: null,
    createdAt,
    results: { inwellScore, metrics: [], bodyFat: null } as unknown as FullReport,
  };
}

/**
 * Unit tests for the eNPS-style loyalty aggregate and the generic
 * questionnaire group aggregate -- see the code review, section 2: "a
 * formula bug [in buildLoyaltyMetric] would silently misreport a
 * customer's dashboard number and nothing would flag it." These were
 * file-private helpers; exported specifically to make this possible (see
 * the comment on buildLoyaltyMetric in corporateAggregation.ts).
 */

function loyaltyRow(rating: number, createdAt: Date = new Date('2026-01-01T00:00:00Z')): SafeResponseRow & { results: QuestionnaireReport } {
  return {
    department: 'sales',
    region: 'tashkent_city',
    age: 30,
    gender: 'M',
    activityKey: null,
    answers: { '1': rating },
    createdAt,
    results: {
      testKey: 'loyalty',
      measuredAt: new Date().toISOString(),
      headlineScore: Math.round((rating / 10) * 100),
      band: 'medium',
      positiveDirection: true,
      subscales: [],
    },
  };
}

describe('buildLoyaltyMetric', () => {
  it('returns null averageScore and null metric when there are no ratings', () => {
    const { averageScore, metric } = buildLoyaltyMetric([], 'ru');
    expect(averageScore).toBeNull();
    expect(metric).toBeNull();
  });

  it('computes eNPS as 100 when every respondent is a promoter (9-10)', () => {
    const rows = [loyaltyRow(9), loyaltyRow(10), loyaltyRow(9)];
    const { averageScore } = buildLoyaltyMetric(rows, 'ru');
    expect(averageScore).toBe(100);
  });

  it('computes eNPS as -100 when every respondent is a detractor (0-6)', () => {
    const rows = [loyaltyRow(0), loyaltyRow(3), loyaltyRow(6)];
    const { averageScore } = buildLoyaltyMetric(rows, 'ru');
    expect(averageScore).toBe(-100);
  });

  it('computes eNPS as 0 when promoters and detractors cancel out', () => {
    const rows = [loyaltyRow(10), loyaltyRow(0)];
    const { averageScore } = buildLoyaltyMetric(rows, 'ru');
    expect(averageScore).toBe(0);
  });

  it('ignores passives (7-8) in the eNPS calculation but counts them in the total', () => {
    // 1 promoter (10), 1 detractor (0), 2 passives (7,8) -> (1-1)/4 * 100 = 0,
    // NOT (1-1)/2*100 -- passives must be part of the denominator.
    const rows = [loyaltyRow(10), loyaltyRow(0), loyaltyRow(7), loyaltyRow(8)];
    const { averageScore, metric } = buildLoyaltyMetric(rows, 'ru');
    expect(averageScore).toBe(0);
    expect(metric!.distribution).toEqual([
      { level: 2, label: 'Промоутеры (9–10)', pct: 25 },
      { level: 1, label: 'Нейтралы (7–8)', pct: 50 },
      { level: 0, label: 'Критики (0–6)', pct: 25 },
    ]);
  });

  it('is not swayed by the headline eNPS-style score field -- it reads the raw answers, not results.headlineScore', () => {
    // A row whose results.headlineScore says "90" (a great individual
    // score) but whose raw rating is a detractor (2) must still count as
    // a detractor -- this is the exact bug class the code review section 2
    // called out ("computed from raw stored answers, not from averaged
    // per-response headline scores").
    const row = loyaltyRow(2);
    row.results.headlineScore = 90;
    const { averageScore } = buildLoyaltyMetric([row], 'ru');
    expect(averageScore).toBe(-100);
  });

  it('ignores rows with a missing or non-numeric raw rating', () => {
    const rows = [loyaltyRow(10), { ...loyaltyRow(9), answers: {} }];
    const { averageScore } = buildLoyaltyMetric(rows, 'ru');
    // Only the first row has a usable rating -> single promoter -> 100
    expect(averageScore).toBe(100);
  });
});

function wellbeingRow(headlineScore: number, subscales: { key: string; score: number }[] = [], createdAt: Date = new Date('2026-01-01T00:00:00Z')): SafeResponseRow & { results: QuestionnaireReport } {
  return {
    department: 'it',
    region: 'tashkent_city',
    age: 28,
    gender: 'F',
    activityKey: null,
    answers: {},
    createdAt,
    results: {
      testKey: 'wellbeing',
      measuredAt: new Date().toISOString(),
      headlineScore,
      band: 'medium',
      positiveDirection: true,
      subscales,
    },
  };
}

describe('buildQuestionnaireGroupAggregate', () => {
  it('averages headlineScore across rows for a non-loyalty test', () => {
    const rows = [wellbeingRow(80), wellbeingRow(60), wellbeingRow(40)];
    const group = buildQuestionnaireGroupAggregate('all', 'Все', rows, 'wellbeing', 'ru');
    expect(group.averageScore).toBe(60);
    expect(group.participantCount).toBe(3);
  });

  it('averages each subscale independently across rows (burnout)', () => {
    const rows = [
      wellbeingRow(50, [
        { key: 'exhaustion', score: 80 },
        { key: 'cynicism', score: 20 },
      ]),
      wellbeingRow(30, [
        { key: 'exhaustion', score: 40 },
        { key: 'cynicism', score: 60 },
      ]),
    ];
    const group = buildQuestionnaireGroupAggregate('all', 'Все', rows, 'burnout', 'ru');
    const exhaustion = group.metrics.find((m) => m.key === 'exhaustion');
    const cynicism = group.metrics.find((m) => m.key === 'cynicism');
    expect(exhaustion?.average).toBe(60); // (80+40)/2
    expect(cynicism?.average).toBe(40); // (20+60)/2
  });

  it('delegates to buildLoyaltyMetric for the loyalty test type instead of averaging headlineScore', () => {
    const rows = [loyaltyRow(10), loyaltyRow(0)];
    const group = buildQuestionnaireGroupAggregate('all', 'Все', rows, 'loyalty', 'ru');
    // Straight average of headlineScore would be (100+0)/2 = 50 -- the
    // point of buildLoyaltyMetric is that eNPS (0 here, see above) is used
    // instead.
    expect(group.averageScore).toBe(0);
    expect(group.metrics.some((m) => m.key === 'nps_distribution')).toBe(true);
  });

  it('returns null averageScore and an empty metrics array for an empty group', () => {
    const group = buildQuestionnaireGroupAggregate('all', 'Все', [], 'wellbeing', 'ru');
    expect(group.averageScore).toBeNull();
    expect(group.participantCount).toBe(0);
    expect(group.metrics).toEqual([]);
  });
});

/**
 * Тесты на карточки-бейджи (band/headlineBand) -- см. план редизайна
 * результатов: раньше компания видела голое число без объяснения, хорошо
 * это или плохо. Направление и пороги здесь -- ровно то, что легко перепутать
 * молча (например, назвать высокий риск выгорания "хорошим уровнем"), а
 * ошибка не будет заметна без явного теста на конкретные числа.
 */
describe('headlineBand / band -- interpretation cards', () => {
  it('burnout: risk direction, 34/67 thresholds, on both headline and every subscale', () => {
    const low = buildQuestionnaireGroupAggregate('all', 'Все', [wellbeingRow(20, [{ key: 'exhaustion', score: 20 }])], 'burnout', 'ru');
    expect(low.headlineBand).toEqual({ label: 'Низкий риск', color: 'good' });
    expect(low.metrics.find((m) => m.key === 'exhaustion')?.band).toEqual({ label: 'Низкий риск', color: 'good' });

    const mid = buildQuestionnaireGroupAggregate('all', 'Все', [wellbeingRow(50, [{ key: 'exhaustion', score: 50 }])], 'burnout', 'ru');
    expect(mid.headlineBand).toEqual({ label: 'Средний риск', color: 'warn' });
    expect(mid.metrics.find((m) => m.key === 'exhaustion')?.band).toEqual({ label: 'Средний риск', color: 'warn' });

    const high = buildQuestionnaireGroupAggregate('all', 'Все', [wellbeingRow(80, [{ key: 'exhaustion', score: 80 }])], 'burnout', 'ru');
    expect(high.headlineBand).toEqual({ label: 'Повышенный риск', color: 'risk' });
    expect(high.metrics.find((m) => m.key === 'exhaustion')?.band).toEqual({ label: 'Повышенный риск', color: 'risk' });
  });

  it('turnover: risk direction, no subscales', () => {
    const high = buildQuestionnaireGroupAggregate('all', 'Все', [wellbeingRow(70)], 'turnover', 'ru');
    expect(high.headlineBand).toEqual({ label: 'Повышенный риск', color: 'risk' });
  });

  it('wellbeing / psychSafety: positive direction -- mirrors risk direction (high score = good, not bad)', () => {
    const high = buildQuestionnaireGroupAggregate('all', 'Все', [wellbeingRow(80)], 'wellbeing', 'ru');
    expect(high.headlineBand).toEqual({ label: 'Хороший уровень', color: 'good' });

    const low = buildQuestionnaireGroupAggregate('all', 'Все', [wellbeingRow(10)], 'wellbeing', 'ru');
    expect(low.headlineBand).toEqual({ label: 'Низкий уровень', color: 'risk' });
  });

  it('loyalty: uses the eNPS scale (-100..100), not the 34/67 thresholds -- this is the bug the redesign fixes (no more "/100" on a negative eNPS)', () => {
    const belowZero = buildQuestionnaireGroupAggregate('all', 'Все', [loyaltyRow(2)], 'loyalty', 'ru');
    expect(belowZero.averageScore).toBe(-100);
    expect(belowZero.headlineBand).toEqual({ label: 'Ниже нуля', color: 'risk' });

    const solid = buildQuestionnaireGroupAggregate('all', 'Все', [loyaltyRow(10)], 'loyalty', 'ru');
    expect(solid.averageScore).toBe(100);
    expect(solid.headlineBand).toEqual({ label: 'Хороший результат', color: 'good' });
  });

  it('fitness: reuses the existing 5-level bandFromScore/BAND_LABEL, collapsed to 4 badge colors', () => {
    const excellentRows = [fitnessRowWithScore(92)];
    const excellent = buildAuditAggregation(excellentRows, {}, 'fitness', 'ru');
    expect(excellent.overall.headlineBand).toEqual({ label: 'Отлично', color: 'good' });

    const attention = buildAuditAggregation([fitnessRowWithScore(15)], {}, 'fitness', 'ru');
    expect(attention.overall.headlineBand).toEqual({ label: 'Требует внимания', color: 'risk' });
  });
});

describe('buildAuditAggregation -- responsesByDay', () => {
  it('groups responses by calendar day (UTC date, from createdAt) and sorts ascending', () => {
    const rows = [
      wellbeingRow(50, [], new Date('2026-01-03T10:00:00Z')),
      wellbeingRow(60, [], new Date('2026-01-01T09:00:00Z')),
      wellbeingRow(70, [], new Date('2026-01-01T22:00:00Z')),
      wellbeingRow(80, [], new Date('2026-01-02T00:00:00Z')),
    ];
    const aggregation = buildAuditAggregation(rows, {}, 'wellbeing', 'ru');
    expect(aggregation.responsesByDay).toEqual([
      { date: '2026-01-01', count: 2 },
      { date: '2026-01-02', count: 1 },
      { date: '2026-01-03', count: 1 },
    ]);
  });

  it('respects applied filters -- responsesByDay only counts the filtered rows, not all of them', () => {
    const rows = [
      { ...wellbeingRow(50, [], new Date('2026-01-01T00:00:00Z')), department: 'it' },
      { ...wellbeingRow(60, [], new Date('2026-01-01T00:00:00Z')), department: 'sales' },
      { ...wellbeingRow(70, [], new Date('2026-01-02T00:00:00Z')), department: 'it' },
    ];
    const aggregation = buildAuditAggregation(rows, { department: 'it' }, 'wellbeing', 'ru');
    expect(aggregation.responsesByDay).toEqual([
      { date: '2026-01-01', count: 1 },
      { date: '2026-01-02', count: 1 },
    ]);
  });

  it('returns an empty array when there are no responses', () => {
    const aggregation = buildAuditAggregation([], {}, 'wellbeing', 'ru');
    expect(aggregation.responsesByDay).toEqual([]);
  });
});
