import type { IntakeFormState, FullReport } from './types';
import type { Lang } from '../i18n/LanguageContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export class ApiError extends Error {
  fieldErrors?: Record<string, string[]>;
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export interface SubmitResult {
  report: FullReport;
  saved: boolean;
  /** Только для personal (/api/assessments): true, если расчёт привязан к
   * телефону — то есть при следующей отправке с тем же номером можно будет
   * показать "Динамику". Для corporate всегда false/не используется. */
  trackable?: boolean;
}

function isPhoneEffectivelyEmpty(v: string): boolean {
  return v.trim() === '' || v.trim() === '+998';
}

export async function submitAssessment(form: IntakeFormState, lang: Lang): Promise<SubmitResult> {
  const payload = {
    phone: isPhoneEffectivelyEmpty(form.phone) ? undefined : form.phone.trim(),
    email: form.email.trim() || undefined,
    region: form.region,
    gender: form.gender,
    age: Number(form.age),
    activityKey: form.activityKey,
    height: Number(form.height),
    weight: Number(form.weight),
    waist: Number(form.waist),
    hip: Number(form.hip),
    chest: Number(form.chest),
    neck: Number(form.neck),
    bicepsR: Number(form.bicepsR),
    bicepsL: Number(form.bicepsL),
    thighR: Number(form.thighR),
    thighL: Number(form.thighL),
    lang,
  };

  const res = await fetch(`${API_BASE}/api/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || 'request_failed', body.details?.fieldErrors);
  }

  const data = await res.json();
  return { report: data.report as FullReport, saved: Boolean(data.saved), trackable: Boolean(data.trackable) };
}

/** Публичный счётчик для hero personal-лендинга — сколько всего расчётов
 * реально сохранено (personal + corporate вместе, см. routes/stats.ts).
 * Ошибка/недоступность бэкенда не должна ломать лендинг — вызывающая
 * сторона просто не показывает строку со счётчиком, если получила null. */
export async function getTotalStatsCount(): Promise<number | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stats/total-count`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.total === 'number' ? data.total : null;
  } catch {
    return null;
  }
}

export interface PublicAuditInfo {
  companyName: string;
  status: 'active' | 'full' | 'expired';
}

/** GET /api/audits/:token — не требует логина. 404 -> null (страница сама
 * решает, что показать: "не найден" vs. expired/full, которые приходят
 * вместе со статусом когда аудит существует). */
export async function getPublicAuditInfo(token: string): Promise<PublicAuditInfo | null> {
  const res = await fetch(`${API_BASE}/api/audits/${encodeURIComponent(token)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError('request_failed');
  return res.json();
}

/** Анонимная отправка ответа сотрудника по корпоративной ссылке. Без
 * телефона/email/имени — только то, что реально нужно расчёту + department
 * для группировки на дашборде компании. Переиспользует ту же форму
 * (IntakeForm mode="corporate"), поэтому payload собирается из того же
 * IntakeFormState. */
export async function submitCorporateResponse(token: string, form: IntakeFormState, lang: Lang): Promise<SubmitResult> {
  const payload = {
    department: form.department || undefined,
    region: form.region,
    gender: form.gender,
    age: Number(form.age),
    activityKey: form.activityKey,
    height: Number(form.height),
    weight: Number(form.weight),
    waist: Number(form.waist),
    hip: Number(form.hip),
    chest: Number(form.chest),
    neck: Number(form.neck),
    bicepsR: Number(form.bicepsR),
    bicepsL: Number(form.bicepsL),
    thighR: Number(form.thighR),
    thighL: Number(form.thighL),
    lang,
  };

  const res = await fetch(`${API_BASE}/api/audits/${encodeURIComponent(token)}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || 'request_failed', body.details?.fieldErrors);
  }

  const data = await res.json();
  return { report: data.report as FullReport, saved: Boolean(data.saved) };
}
