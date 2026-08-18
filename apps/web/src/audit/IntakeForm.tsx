import React, { useState } from 'react';
import { useLanguage, fillTemplate } from '../i18n/LanguageContext';
import { PhoneInput } from './PhoneInput';
import { FieldTooltip } from './FieldTooltip';
import type { MeasureKind } from './MeasureIllustration';
import { REGION_IDS } from './regions';
import { EMPTY_FORM, DEPARTMENT_KEYS, type IntakeFormState, type ActivityKey, type Gender } from './types';
import { submitAssessment, submitCorporateResponse, ApiError, type SubmitResult } from './api';
import { Loader2 } from 'lucide-react';

interface IntakeFormProps {
  onResult: (result: SubmitResult) => void;
  /** 'corporate' переиспользует полностью ту же форму/вёрстку, но: прячет
   * телефон/email (анонимно, по ТЗ), показывает поле "Отдел" и отправляет
   * ответ на публичный роут аудита вместо /api/assessments. Расчёты те же —
   * submitCorporateResponse вызывает тот же computeFullReport на бэкенде. */
  mode?: 'personal' | 'corporate';
  auditToken?: string;
}

const BODY_FIELDS: { key: 'height' | 'weight' | 'waist' | 'hip' | 'chest' | 'neck' | 'bicepsR' | 'bicepsL' | 'thighR' | 'thighL'; kind: MeasureKind; range: [number, number] }[] = [
  { key: 'height', kind: 'height', range: [50, 250] },
  { key: 'weight', kind: 'weight', range: [35, 300] },
  { key: 'waist', kind: 'waist', range: [40, 250] },
  { key: 'hip', kind: 'hip', range: [40, 250] },
  { key: 'chest', kind: 'chest', range: [40, 250] },
  { key: 'neck', kind: 'neck', range: [20, 60] },
  { key: 'bicepsR', kind: 'arm', range: [15, 70] },
  { key: 'bicepsL', kind: 'arm', range: [15, 70] },
  { key: 'thighR', kind: 'thigh', range: [20, 120] },
  { key: 'thighL', kind: 'thigh', range: [20, 120] },
];

const AGE_RANGE: [number, number] = [12, 99];

const ACTIVITY_ORDER: ActivityKey[] = ['sedentary', 'light', 'moderate', 'heavy', 'veryHeavy'];

/** PhoneInput pre-fills "+998 " on focus so the mask is visible — if the
 * person never types a digit and clicks away, that counts as "left empty",
 * not as an invalid phone. */
function isPhoneEffectivelyEmpty(v: string): boolean {
  return v.trim() === '' || v.trim() === '+998';
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ onResult, mode = 'personal', auditToken }) => {
  const { t, lang } = useLanguage();
  const f = t.audit.form;
  const cp = t.corporate.publicAudit;
  const isCorporate = mode === 'corporate';
  const [form, setForm] = useState<IntakeFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const rangeError = (min: number, max: number) => fillTemplate(f.rangeError, { min, max });

  const set = <K extends keyof IntakeFormState>(key: K, value: IntakeFormState[K]) => {
    setForm((prevForm) => ({ ...prevForm, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (isCorporate) {
      if (!form.department) next.department = f.required;
    } else if (!isPhoneEffectivelyEmpty(form.phone) && !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(form.phone)) {
      // Телефон необязателен, но если что-то введено — должен быть валидным.
      next.phone = f.errorPhone;
    }
    if (!form.region) next.region = f.required;
    if (!form.gender) next.gender = f.required;

    const age = Number(form.age);
    if (!form.age || age < AGE_RANGE[0] || age > AGE_RANGE[1]) next.age = rangeError(AGE_RANGE[0], AGE_RANGE[1]);

    if (!form.activityKey) next.activityKey = f.required;

    for (const { key, range } of BODY_FIELDS) {
      const v = Number(form[key]);
      if (!form[key] || v < range[0] || v > range[1]) next[key] = rangeError(range[0], range[1]);
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = isCorporate && auditToken ? await submitCorporateResponse(auditToken, form, lang) : await submitAssessment(form, lang);
      onResult(result);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const mapped: Record<string, string> = {};
        for (const [k, msgs] of Object.entries(err.fieldErrors)) mapped[k] = msgs[0];
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      setServerError(f.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (key: string) =>
    `w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-lg border bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition-colors ${
      errors[key] ? 'border-rose-400' : 'border-sky-200 focus:border-brand-teal'
    }`;
  const labelClass = 'block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5';
  const hintClass = 'text-[10px] sm:text-xs text-slate-400 mt-1';
  const errorClass = 'text-[10px] sm:text-xs text-rose-500 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <fieldset className="space-y-3 sm:space-y-4">
        <legend className="text-sm sm:text-lg font-bold text-slate-900 mb-1">{f.sectionPersonal}</legend>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {isCorporate ? (
            <div className="col-span-2">
              <label className={labelClass}>{cp.departmentLabel}</label>
              <select value={form.department} onChange={(e) => set('department', e.target.value as IntakeFormState['department'])} className={inputClass('department')}>
                <option value="">{cp.departmentPlaceholder}</option>
                {DEPARTMENT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {cp.departments[key]}
                  </option>
                ))}
              </select>
              {errors.department && <p className={errorClass}>{errors.department}</p>}
            </div>
          ) : (
            <>
              <div className="col-span-2">
                <label className={labelClass}>{f.fields.phone.label}</label>
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1.5">{f.phoneNote}</p>
                <PhoneInput value={form.phone} onChange={(v) => set('phone', v)} error={errors.phone} />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>

              <div className="col-span-2">
                <label className={labelClass}>{f.fields.email.label}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder={f.fields.email.placeholder}
                  className={inputClass('email')}
                />
              </div>
            </>
          )}

          <div className="col-span-2">
            <label className={labelClass}>{f.fields.region.label}</label>
            <select value={form.region} onChange={(e) => set('region', e.target.value as IntakeFormState['region'])} className={inputClass('region')}>
              <option value="">{f.fields.region.placeholder}</option>
              {REGION_IDS.map((id) => (
                <option key={id} value={id}>
                  {f.regions[id]}
                </option>
              ))}
            </select>
            {errors.region && <p className={errorClass}>{errors.region}</p>}
          </div>

          <div>
            <label className={labelClass}>{f.fields.gender.label}</label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value as Gender)} className={inputClass('gender')}>
              <option value="">{f.fields.gender.placeholder}</option>
              <option value="M">{f.fields.gender.male}</option>
              <option value="F">{f.fields.gender.female}</option>
            </select>
            {errors.gender && <p className={errorClass}>{errors.gender}</p>}
          </div>

          <div>
            <label className={labelClass}>{f.fields.age.label}</label>
            <input
              type="number"
              inputMode="numeric"
              min={AGE_RANGE[0]}
              max={AGE_RANGE[1]}
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder={f.fields.age.placeholder}
              className={inputClass('age')}
            />
            {errors.age && <p className={errorClass}>{errors.age}</p>}
          </div>

          <div className="col-span-2">
            <label className={labelClass}>{f.fields.activity.label}</label>
            <select
              value={form.activityKey}
              onChange={(e) => set('activityKey', e.target.value as ActivityKey)}
              className={inputClass('activityKey')}
            >
              <option value="">—</option>
              {ACTIVITY_ORDER.map((key) => (
                <option key={key} value={key}>
                  {f.fields.activity.options[key]}
                </option>
              ))}
            </select>
            <p className={hintClass}>{f.fields.activity.usedFor}</p>
            {errors.activityKey && <p className={errorClass}>{errors.activityKey}</p>}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3 sm:space-y-4">
        <legend className="text-sm sm:text-lg font-bold text-slate-900 mb-1">{f.sectionBody}</legend>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {BODY_FIELDS.map(({ key, kind }) => {
            const field = f.fields[key];
            return (
              <div key={key}>
                <label className={`flex items-center ${labelClass}`}>
                  {field.label} <span className="text-slate-400 font-normal ml-1">({key === 'weight' ? f.units.kg : f.units.cm})</span>
                  <FieldTooltip title={field.tooltipTitle} text={field.tooltipText} illustration={kind} />
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={field.placeholder}
                  className={inputClass(key)}
                />
                <p className={hintClass}>{field.usedFor}</p>
                {errors[key] && <p className={errorClass}>{errors[key]}</p>}
              </div>
            );
          })}
        </div>
      </fieldset>

      {serverError && <p className="text-xs sm:text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">{serverError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-brand-blue hover:bg-brand-blue-light transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{f.submitting}</span>
          </>
        ) : (
          <span>{f.submit}</span>
        )}
      </button>
    </form>
  );
};
