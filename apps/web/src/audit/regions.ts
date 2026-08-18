/** Должно точно совпадать с apps/api/src/regions.ts (REGION_IDS). */
export const REGION_IDS = [
  'tashkent_city',
  'tashkent_region',
  'andijan',
  'bukhara',
  'fergana',
  'jizzakh',
  'namangan',
  'navoiy',
  'qashqadaryo',
  'samarkand',
  'sirdaryo',
  'surkhandarya',
  'khorezm',
] as const;

export type RegionId = (typeof REGION_IDS)[number];
