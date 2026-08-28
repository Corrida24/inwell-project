/**
 * Small formatting helpers shared between ReportView.tsx (rendering) and
 * useFitnessReportData.ts (data derivation) -- pulled out of ReportView.tsx
 * so the hook doesn't have to import from the component file it's extracted
 * from (that would be backwards). See the code review, section 6, on
 * ReportView.tsx mixing data shaping with rendering.
 */

export function fmt(v: number | null, digits = 1, lang = 'ru'): string {
  if (v === null || Number.isNaN(v)) return '—';
  return v.toLocaleString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function metricDigits(key: string): number {
  if (key === 'whtr' || key === 'whr') return 2;
  if (key === 'absi') return 4;
  if (key === 'bmi') return 1;
  return 2;
}
