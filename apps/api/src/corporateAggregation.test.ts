import { describe, it, expect } from 'vitest';
import { buildLoyaltyMetric, buildQuestionnaireGroupAggregate } from './corporateAggregation.js';
import type { QuestionnaireReport } from './calc/questionnaire/computeQuestionnaireReport.js';
import type { SafeResponseRow } from './db/responsesRepo.js';

/**
 * Unit tests for the eNPS-style loyalty aggregate and the generic
 * questionnaire group aggregate -- see the code review, section 2: "a
 * formula bug [in buildLoyaltyMetric] would silently misreport a
 * customer's dashboard number and nothing would flag it." These were
 * file-private helpers; exported specifically to make this possible (see
 * the comment on buildLoyaltyMetric in corporateAggregation.ts).
 */

function loyaltyRow(rating: number): SafeResponseRow & { results: QuestionnaireReport } {
  return {
    department: 'sales',
    region: 'tashkent_city',
    age: 30,
    gender: 'M',
    activityKey: null,
    answers: { '1': rating },
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

function wellbeingRow(headlineScore: number, subscales: { key: string; score: number }[] = []): SafeResponseRow & { results: QuestionnaireReport } {
  return {
    department: 'it',
    region: 'tashkent_city',
    age: 28,
    gender: 'F',
    activityKey: null,
    answers: {},
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
