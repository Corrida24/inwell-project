/**
 * Генерик-скорер для 5 новых тестов — сумма/среднее по нормализованным
 * (0..1) ответам, с поддержкой обратных пунктов и подшкал, привёденных к
 * 0-100. Это НЕ клинические/официальные формулы оригинальных методик (у
 * MBI, например, вообще нет единого числа) — собственная сводная метрика
 * проекта, честно помеченная как таковая (см. комментарий у burnout ниже
 * и в плане реализации).
 */
import { TEST_DEFINITIONS } from './registry.js';
import type { TestKey } from './types.js';

export class InvalidAnswersError extends Error {}

export interface SubscaleScore {
  key: string;
  score: number; // 0-100
}

export interface QuestionnaireReport {
  testKey: TestKey;
  measuredAt: string;
  headlineScore: number; // 0-100
  band: 'low' | 'medium' | 'high';
  /** true — выше значит лучше (лояльность/благополучие/безопасность);
   * false — выше значит хуже, это риск-метрика (выгорание/увольнение).
   * Нужно фронтенду, чтобы красить полосу/бейдж в правильную сторону. */
  positiveDirection: boolean;
  subscales: SubscaleScore[];
  openText?: string;
}

const POSITIVE_DIRECTION: Record<TestKey, boolean> = {
  loyalty: true,
  wellbeing: true,
  psychSafety: true,
  burnout: false,
  turnover: false,
};

function normalize(value: number, min: number, max: number, reverse: boolean): number {
  const span = max - min || 1;
  const n = reverse ? (max - value) / span : (value - min) / span;
  return Math.max(0, Math.min(1, n));
}

function bandFor(score: number): 'low' | 'medium' | 'high' {
  if (score >= 67) return 'high';
  if (score >= 34) return 'medium';
  return 'low';
}

/** answers — {questionId: raw value}, ключи как в TestDefinition.questions[].id
 * (1-based, тот же порядок, что и в t.tests.<key>.questions[] на фронте). */
export function computeQuestionnaireReport(testKey: TestKey, answers: Record<number, number>, openText: string | undefined): QuestionnaireReport {
  const def = TEST_DEFINITIONS[testKey];
  if (!def) throw new InvalidAnswersError(`unknown test key: ${testKey}`);

  const normalized: Record<number, number> = {};
  for (const q of def.questions) {
    const v = answers[q.id];
    if (typeof v !== 'number' || Number.isNaN(v) || v < def.scaleMin || v > def.scaleMax) {
      throw new InvalidAnswersError(`missing or out-of-range answer for question ${q.id} (expected ${def.scaleMin}-${def.scaleMax})`);
    }
    normalized[q.id] = normalize(v, def.scaleMin, def.scaleMax, Boolean(q.reverseScored));
  }

  const subscales: SubscaleScore[] = (def.subscales ?? []).map((s) => {
    const avg = s.questionIds.reduce((acc, id) => acc + normalized[id], 0) / s.questionIds.length;
    return { key: s.key, score: Math.round(avg * 100) };
  });

  let headlineScore: number;
  if (subscales.length > 0) {
    // Композит из подшкал (сейчас — только выгорание, 3 подшкалы одного
    // направления: все про "больше признаков выгорания"). Простое среднее.
    headlineScore = Math.round(subscales.reduce((a, s) => a + s.score, 0) / subscales.length);
  } else {
    const all = def.questions.map((q) => normalized[q.id]);
    headlineScore = Math.round((all.reduce((a, b) => a + b, 0) / all.length) * 100);
  }

  return {
    testKey,
    measuredAt: new Date().toISOString(),
    headlineScore,
    band: bandFor(headlineScore),
    positiveDirection: POSITIVE_DIRECTION[testKey],
    subscales,
    openText: openText && openText.trim() ? openText.trim() : undefined,
  };
}
