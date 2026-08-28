/**
 * Общие типы генерик-движка опросников (5 новых тестов). Математика/
 * структура — здесь и в registry.ts; локализованные подписи для UI живут
 * отдельно (frontend: apps/web/src/i18n/{ru,uz}.ts под ключом t.tests.*,
 * backend-only подписи для агрегации: ./content.ts) — тот же принцип
 * разделения "математика / текст", что и metricsRegistry.ts / content.ts
 * для фитнес-теста.
 *
 * TEST_KEYS/TestKey/TestType/TEST_TYPES/isQuestionnaireTestKey used to be
 * hand-duplicated here AND in apps/web/src/corporate/types.ts AND
 * apps/web/src/audit/types.ts (see code review, section 5). They now live
 * once in packages/shared and are re-exported from here so every existing
 * import within apps/api keeps working unchanged.
 */

import type { TestKey } from '@inwell/shared';

export { TEST_KEYS, TEST_TYPES, isQuestionnaireTestKey } from '@inwell/shared';
export type { TestKey, TestType } from '@inwell/shared';

export interface QuestionDefinition {
  id: number;
  /** Пункт сформулирован "в обратную сторону" относительно шкалы вопроса —
   * например "Мне сложно закончить рабочий день с чувством выполненного
   * долга" внутри шкалы, где высокий балл в среднем должен означать высокую
   * результативность. Ни один из 5 тестов в этой поставке не использует
   * reverseScored (все пункты намеренно сформулированы в одном
   * направлении — так меньше риск рассинхронизации между текстом вопроса
   * в i18n и флагом здесь), но движок его поддерживает — для будущих
   * тестов, где переформулировать все пункты в одну сторону невозможно
   * без потери смысла. */
  reverseScored?: boolean;
}

export interface SubscaleDefinition {
  key: string;
  questionIds: number[];
}

export interface TestDefinition {
  key: TestKey;
  /** Мин/макс шкалы ответа на ОДИН пункт (1-5 для большинства тестов;
   * 0-10 — рейтинг лояльности). Один диапазон на весь тест — ни одному из
   * 5 тестов не нужна разная шкала для разных пунктов. */
  scaleMin: number;
  scaleMax: number;
  questions: QuestionDefinition[];
  /** Только у теста на выгорание — 3-факторная структура (по мотивам
   * MBI). У остальных 4 тестов подшкал нет — один общий балл. */
  subscales?: SubscaleDefinition[];
  /** true — тест на лояльность: помимо шкального вопроса собираем один
   * необязательный открытый текстовый комментарий. */
  hasOpenText?: boolean;
}
