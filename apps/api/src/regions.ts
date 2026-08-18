/**
 * 12 областей Узбекистана + город Ташкент отдельно (13 вариантов), как
 * попросили — без Республики Каракалпакстан. Id используется как значение
 * в БД и в API; локализованные названия — на фронтенде (src/i18n).
 */
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
