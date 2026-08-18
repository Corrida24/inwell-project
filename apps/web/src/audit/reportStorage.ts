/** sessionStorage key used to hand the just-computed report from
 * /personal/start to /personal/report (no backend "get report by id" yet —
 * out of scope for this pass, see project README). */
export const REPORT_STORAGE_KEY = 'inwell_personal_report_v1';

/** /a/:token (corporate public form) reuses the exact same /personal/report
 * page/component instead of duplicating the whole report layout — this key
 * just tells that page "this particular result came from an anonymous
 * corporate audit", so it can skip the phone-linked "saved" note and the
 * personal "new assessment" CTA (neither applies to a one-shot anonymous
 * corporate response). Absent/'personal' = default personal behaviour,
 * unchanged. */
export const REPORT_SOURCE_KEY = 'inwell_report_source_v1';
export type ReportSource = 'personal' | 'corporate';
