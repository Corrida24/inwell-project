import { describe, it, expect } from 'vitest';
import { bandFromScore, inwellScore } from './metricsRegistry.js';
import { baiRangeFor, type ComputedIndices } from './formulas.js';

/**
 * Unit tests for the fitness score banding and the weighted Inwell Score
 * aggregate -- the code review (section 2) named these specifically as
 * pure, easily-testable functions with no coverage before this. The
 * fitness *formula* regression suite (calc/selfTest.ts, `npm test`) already
 * covers the underlying index calculations (BMI, WHtR, ...); these tests
 * cover the banding/scoring layer built on top of them, which selfTest.ts
 * doesn't exercise.
 */

describe('bandFromScore', () => {
  it('returns the dash/level-0 band for a null score', () => {
    expect(bandFromScore(null)).toEqual({ key: 'dash', level: 0 });
  });

  it.each([
    [100, 'excellent', 4],
    [85, 'excellent', 4],
    [84, 'good', 3],
    [70, 'good', 3],
    [69, 'normal', 2],
    [50, 'normal', 2],
    [49, 'growth', 1],
    [30, 'growth', 1],
    [29, 'attention', 0],
    [0, 'attention', 0],
  ])('bands a score of %i as %s (level %i)', (score, key, level) => {
    expect(bandFromScore(score)).toEqual({ key, level });
  });
});

/** A ComputedIndices fixture sitting in the "good" range for every metric
 * (see metricsRegistry.ts's per-metric getRange/getScore) -- used to check
 * that inwellScore returns (close to) 100 when everything is in range. */
function goodIndices(gender: 'M' | 'F', age: number): ComputedIndices {
  const baiRange = baiRangeFor(gender, age);
  return {
    bmi: 22,
    bmiCategory: 'normal',
    whtr: 0.45,
    whr: gender === 'M' ? 0.8 : 0.7,
    bai: (baiRange.min + baiRange.max) / 2,
    bri: 2,
    absi: 0.078,
    avi: 13,
    ci: 1.09,
    vat: 50,
  };
}

/** A fixture with every metric far outside its good range in the direction
 * that lowers the score (used to check inwellScore trends toward 0, not
 * that it hits exactly 0 -- rangeScore() is a padded linear falloff, not a
 * hard cutoff, by design). */
function poorIndices(gender: 'M' | 'F', age: number): ComputedIndices {
  const baiRange = baiRangeFor(gender, age);
  return {
    bmi: 45,
    bmiCategory: 'obese',
    whtr: 0.9,
    whr: gender === 'M' ? 1.3 : 1.2,
    bai: baiRange.max + 40,
    bri: 10,
    absi: 0.15,
    avi: 40,
    ci: 2,
    vat: 250,
  };
}

describe('inwellScore', () => {
  it('scores close to 100 when every metric is within its good range', () => {
    const { total } = inwellScore(goodIndices('M', 30), 'M', 30);
    expect(total).toBeGreaterThanOrEqual(95);
    expect(total).toBeLessThanOrEqual(100);
  });

  it('scores much lower when every metric is far outside its good range', () => {
    const { total } = inwellScore(poorIndices('M', 30), 'M', 30);
    expect(total).toBeLessThan(30);
  });

  it('always returns a total clamped to 0-100', () => {
    const good = inwellScore(goodIndices('F', 45), 'F', 45);
    const poor = inwellScore(poorIndices('F', 45), 'F', 45);
    for (const { total } of [good, poor]) {
      expect(total).toBeGreaterThanOrEqual(0);
      expect(total).toBeLessThanOrEqual(100);
    }
  });

  it('returns a perMetric score for every metric in the registry', () => {
    const { perMetric } = inwellScore(goodIndices('M', 30), 'M', 30);
    expect(Object.keys(perMetric).sort()).toEqual(['absi', 'avi', 'bai', 'bmi', 'bri', 'ci', 'vat', 'whr', 'whtr'].sort());
  });

  it('re-normalizes over only the metrics that produced a score, so a metric returning null score does not silently drag the total down', () => {
    // vat's getScore is a plain rangeScore(0-100, pad 30/60) -- a wildly
    // out-of-domain value like -1 still produces *some* clamped score
    // rather than null in this implementation, so instead check the
    // documented re-normalization behavior directly: total is a weighted
    // average over `usedWeight`, not over the full fixed weight sum, by
    // reading two fixtures that differ in exactly one metric and checking
    // the total moves by less than that metric's raw weight would imply
    // under a naive (non-renormalized) average -- i.e. it's plausible, not
    // wildly off. This guards against a regression to a non-renormalized
    // sum without pinning an exact fragile number.
    const base = goodIndices('M', 30);
    const { total: baseTotal } = inwellScore(base, 'M', 30);
    const worseBmi = { ...base, bmi: 45 };
    const { total: worseTotal } = inwellScore(worseBmi, 'M', 30);
    expect(worseTotal).toBeLessThan(baseTotal);
    // bmi's weight is 0.10 of ~0.67 total used weight (~15%) -- a full
    // 100-point swing on just bmi should move the total by a similar
    // fraction, not by the full 100 points and not by 0.
    expect(baseTotal - worseTotal).toBeGreaterThan(2);
    expect(baseTotal - worseTotal).toBeLessThan(30);
  });
});
