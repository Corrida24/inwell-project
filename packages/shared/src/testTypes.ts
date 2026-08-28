/**
 * Single source of truth for the audit test-type discriminator.
 *
 * Before this package existed, `TestType`/`TestKey` were hand-duplicated in
 * three places that had to be kept in sync by comment discipline alone:
 * apps/api/src/calc/questionnaire/types.ts, apps/web/src/corporate/types.ts,
 * and apps/web/src/audit/types.ts. All three now import from here instead.
 * See the code/process review, section 5, for why this was flagged as the
 * single highest-leverage structural fix available.
 *
 * This does NOT (yet) cover the second half of that section's coupling --
 * the question-id-to-array-index mapping between
 * apps/api/src/calc/questionnaire/registry.ts and the frontend's
 * `t.tests.<key>.questions[]` order in apps/web/src/i18n/{ru,uz}.ts. That
 * remains enforced only by a comment, same as before; unifying it would
 * mean moving question ordering itself into this package, which is a
 * larger change than the enum consolidation done here.
 */

export const TEST_KEYS = ['loyalty', 'burnout', 'turnover', 'wellbeing', 'psychSafety'] as const;
export type TestKey = (typeof TEST_KEYS)[number];

/** 'fitness' is the original, pre-existing test (handled by the untouched
 * computeFullReport() path on the backend). The other 5 go through the
 * generic questionnaire engine. */
export type TestType = 'fitness' | TestKey;
export const TEST_TYPES: TestType[] = ['fitness', ...TEST_KEYS];

export function isQuestionnaireTestKey(v: string): v is TestKey {
  return (TEST_KEYS as readonly string[]).includes(v);
}
