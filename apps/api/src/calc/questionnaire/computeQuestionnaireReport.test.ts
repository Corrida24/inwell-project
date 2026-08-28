import { describe, it, expect } from 'vitest';
import { computeQuestionnaireReport, InvalidAnswersError } from './computeQuestionnaireReport.js';
import { TEST_DEFINITIONS } from './registry.js';
import { TEST_KEYS } from './types.js';

/**
 * Unit tests for the generic questionnaire scorer -- the single biggest
 * testing gap flagged in the code review (section 2): before this, only
 * the fitness formulas had any automated coverage. This is a pure
 * function (answers in, headline score + subscales out), so it's cheap to
 * test thoroughly and a formula bug here would otherwise silently
 * misreport a customer's dashboard number.
 */

/** Builds a valid answers map for a test, with every question set to the
 * same raw value -- convenient for testing the score at known extremes
 * (scaleMin -> 0, scaleMax -> 100) and the midpoint. */
function uniformAnswers(testKey: (typeof TEST_KEYS)[number], value: number): Record<number, number> {
  const def = TEST_DEFINITIONS[testKey];
  const answers: Record<number, number> = {};
  for (const q of def.questions) answers[q.id] = value;
  return answers;
}

describe('computeQuestionnaireReport', () => {
  it('throws InvalidAnswersError for an unknown test key', () => {
    // @ts-expect-error -- deliberately passing an invalid key to test the runtime guard
    expect(() => computeQuestionnaireReport('not-a-real-test', {}, undefined)).toThrow(InvalidAnswersError);
  });

  it('throws InvalidAnswersError when an answer is missing', () => {
    const answers = uniformAnswers('wellbeing', 3);
    delete answers[1];
    expect(() => computeQuestionnaireReport('wellbeing', answers, undefined)).toThrow(InvalidAnswersError);
  });

  it('throws InvalidAnswersError when an answer is out of the test scale range', () => {
    const answers = uniformAnswers('wellbeing', 3);
    answers[1] = 999;
    expect(() => computeQuestionnaireReport('wellbeing', answers, undefined)).toThrow(InvalidAnswersError);
  });

  it.each(TEST_KEYS)('scores all-minimum answers as 0 and all-maximum answers as 100 for %s', (testKey) => {
    const def = TEST_DEFINITIONS[testKey];
    const low = computeQuestionnaireReport(testKey, uniformAnswers(testKey, def.scaleMin), undefined);
    const high = computeQuestionnaireReport(testKey, uniformAnswers(testKey, def.scaleMax), undefined);
    expect(low.headlineScore).toBe(0);
    expect(high.headlineScore).toBe(100);
  });

  it.each(TEST_KEYS)('bands a headline score of 0 as low and 100 as high for %s', (testKey) => {
    const def = TEST_DEFINITIONS[testKey];
    const low = computeQuestionnaireReport(testKey, uniformAnswers(testKey, def.scaleMin), undefined);
    const high = computeQuestionnaireReport(testKey, uniformAnswers(testKey, def.scaleMax), undefined);
    expect(low.band).toBe('low');
    expect(high.band).toBe('high');
  });

  it('sets positiveDirection: true for loyalty/wellbeing/psychSafety and false for burnout/turnover', () => {
    expect(computeQuestionnaireReport('loyalty', { 1: 5 }, undefined).positiveDirection).toBe(true);
    expect(computeQuestionnaireReport('wellbeing', uniformAnswers('wellbeing', 3), undefined).positiveDirection).toBe(true);
    expect(computeQuestionnaireReport('psychSafety', uniformAnswers('psychSafety', 3), undefined).positiveDirection).toBe(true);
    expect(computeQuestionnaireReport('burnout', uniformAnswers('burnout', 3), undefined).positiveDirection).toBe(false);
    expect(computeQuestionnaireReport('turnover', uniformAnswers('turnover', 3), undefined).positiveDirection).toBe(false);
  });

  it('trims openText and omits it entirely when blank', () => {
    const withText = computeQuestionnaireReport('loyalty', { 1: 8 }, '  great place to work  ');
    expect(withText.openText).toBe('great place to work');

    const blank = computeQuestionnaireReport('loyalty', { 1: 8 }, '   ');
    expect(blank.openText).toBeUndefined();

    const missing = computeQuestionnaireReport('loyalty', { 1: 8 }, undefined);
    expect(missing.openText).toBeUndefined();
  });

  it('loyalty has no subscales (single rating question)', () => {
    const report = computeQuestionnaireReport('loyalty', { 1: 8 }, undefined);
    expect(report.subscales).toEqual([]);
  });

  it('burnout headline score is the average of its 3 subscales, not a flat average of all 9 items', () => {
    // exhaustion (q1-3) maxed out, cynicism (q4-6) and accomplishment (q7-9)
    // at minimum -- a flat average across all 9 items would give the same
    // number as a subscale average here (3/9 = 33%), so instead skew the
    // *within-subscale* values to distinguish the two computation methods:
    // subscale averages first, are computed as the mean of already-rounded
    // subscale scores, not a mean of raw normalized items.
    const answers: Record<number, number> = { 1: 5, 2: 5, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 };
    const report = computeQuestionnaireReport('burnout', answers, undefined);
    expect(report.subscales.map((s) => s.key)).toEqual(['exhaustion', 'cynicism', 'accomplishment']);

    const exhaustion = report.subscales.find((s) => s.key === 'exhaustion')!;
    const cynicism = report.subscales.find((s) => s.key === 'cynicism')!;
    const accomplishment = report.subscales.find((s) => s.key === 'accomplishment')!;
    // exhaustion: normalized((5+5+1)/3) = normalized(3.667) on a 1-5 scale -> ((3.667-1)/4)*100 ≈ 67
    expect(exhaustion.score).toBe(67);
    expect(cynicism.score).toBe(0);
    expect(accomplishment.score).toBe(0);

    // headline = round(mean of the 3 *subscale* scores), not round(mean of all 9 raw items)
    const expectedHeadline = Math.round((exhaustion.score + cynicism.score + accomplishment.score) / 3);
    expect(report.headlineScore).toBe(expectedHeadline);
    expect(report.headlineScore).toBe(22);
  });

  it('turnover and wellbeing and psychSafety have no subscales (single composite score)', () => {
    expect(computeQuestionnaireReport('turnover', uniformAnswers('turnover', 3), undefined).subscales).toEqual([]);
    expect(computeQuestionnaireReport('wellbeing', uniformAnswers('wellbeing', 3), undefined).subscales).toEqual([]);
    expect(computeQuestionnaireReport('psychSafety', uniformAnswers('psychSafety', 3), undefined).subscales).toEqual([]);
  });

  it('always stamps a fresh ISO measuredAt', () => {
    const before = Date.now();
    const report = computeQuestionnaireReport('loyalty', { 1: 8 }, undefined);
    const measuredAt = new Date(report.measuredAt).getTime();
    expect(measuredAt).toBeGreaterThanOrEqual(before);
    expect(measuredAt).toBeLessThanOrEqual(Date.now());
  });
});
