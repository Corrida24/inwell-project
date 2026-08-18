/**
 * Регрессионный тест: сверяет TS-порт формул (formulas.ts) с эталонными
 * значениями, посчитанными напрямую оригинальным fitaudit/js/calculations.js
 * (Calc.computeAll) для тех же входных данных. Цель — доказать, что при
 * переносе логики на бэкенд числа не разъехались.
 *
 * Запуск: npm test (см. package.json)
 */
import { computeIndices, bsa, bodyFatNavy, bmrHarrisBenedict, tdee, type Measurements } from './formulas.js';

interface Case {
  name: string;
  input: Measurements;
  activityKey: string;
  expected: {
    bmi: number;
    bmiCategory: string;
    whtr: number;
    whr: number;
    bai: number;
    bri: number;
    absi: number;
    avi: number;
    ci: number;
    vat: number;
  };
  expectedExtra: {
    bsa: number;
    bodyFat: number;
    bmr: number;
    tdee: number;
  };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

const cases: Case[] = [
  {
    name: 'M, 30 лет, 178/82, талия 92, бёдра 100, нога 57.5',
    input: { gender: 'M', age: 30, height: 178, weight: 82, waist: 92, hip: 100, chest: 98, neck: 38, bicepsR: 35, bicepsL: 34, thighR: 58, thighL: 57 },
    activityKey: 'moderate',
    expected: { bmi: 25.88, bmiCategory: 'overweight', whtr: 0.52, whr: 0.92, bai: 24.11, bri: 3.68, absi: 0.0788, avi: 16.97, ci: 1.24, vat: 120.5 },
    expectedExtra: { bsa: 2, bodyFat: 21.5, bmr: 1881, tdee: 2916 },
  },
  {
    name: 'F, 27 лет, 165/60, талия 70, бёдра 96, нога 53.5',
    input: { gender: 'F', age: 27, height: 165, weight: 60, waist: 70, hip: 96, chest: 88, neck: 33, bicepsR: 27, bicepsL: 26.5, thighR: 54, thighL: 53 },
    activityKey: 'light',
    expected: { bmi: 22.04, bmiCategory: 'normal', whtr: 0.42, whr: 0.73, bai: 27.29, bri: 2.05, absi: 0.0693, avi: 10.27, ci: 1.06, vat: 40.1 },
    expectedExtra: { bsa: 1.66, bodyFat: 24.9, bmr: 1408, tdee: 1936 },
  },
];

let failures = 0;

for (const c of cases) {
  const got = computeIndices(c.input);
  for (const key of Object.keys(c.expected) as (keyof Case['expected'])[]) {
    const expectedVal = c.expected[key];
    const gotVal = got[key];
    if (gotVal !== expectedVal) {
      failures++;
      console.error(`✗ [${c.name}] ${key}: expected ${expectedVal}, got ${gotVal}`);
    }
  }

  const gotBsa = round2(bsa(c.input.weight, c.input.height));
  const gotBodyFat = round1(bodyFatNavy(c.input.gender, c.input.waist, c.input.neck, c.input.height, c.input.hip));
  const gotBmr = Math.round(bmrHarrisBenedict(c.input.gender, c.input.weight, c.input.height, c.input.age));
  const gotTdee = Math.round(tdee(gotBmr, c.activityKey));
  const extraGot = { bsa: gotBsa, bodyFat: gotBodyFat, bmr: gotBmr, tdee: gotTdee };
  for (const key of Object.keys(c.expectedExtra) as (keyof Case['expectedExtra'])[]) {
    if (extraGot[key] !== c.expectedExtra[key]) {
      failures++;
      console.error(`✗ [${c.name}] ${key}: expected ${c.expectedExtra[key]}, got ${extraGot[key]}`);
    }
  }

  console.log(`✓ ${c.name} — checked ${Object.keys(c.expected).length + Object.keys(c.expectedExtra).length} fields`);
}

if (failures > 0) {
  console.error(`\n${failures} mismatch(es) — TS port diverges from original calculations.js!`);
  process.exit(1);
} else {
  console.log('\nAll formulas match the original fitaudit calculations.js output.');
}
