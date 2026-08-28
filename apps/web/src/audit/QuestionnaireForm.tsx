import React, { useState } from 'react';
import { useLanguage, fillTemplate } from '../i18n/LanguageContext';
import { LikertScale } from '../components/ui/LikertScale';
import { REGION_IDS } from './regions';
import { DEPARTMENT_KEYS, type QuestionnaireFormState, type QuestionnaireTestKey, type Gender } from './types';
import { submitQuestionnaireResponse, ApiError, type SubmitResult } from './api';
import { Loader2 } from 'lucide-react';

interface QuestionnaireFormProps {
  testKey: QuestionnaireTestKey;
  auditToken: string;
  onResult: (result: SubmitResult) => void;
}

const AGE_RANGE: [number, number] = [12, 99];

const EMPTY_FORM: QuestionnaireFormState = {
  department: '',
  region: '',
  gender: '',
  age: '',
  answers: {},
  openText: '',
};

/**
 * Sibling к IntakeForm.tsx (не модификация) — та же анкетная часть
 * (отдел/город/пол/возраст, те же классы/копирайт), но вместо 10 полей с
 * измерениями тела — вопросы одного из 5 новых тестов, каждый в виде
 * LikertScale. Конфиг-массив-driven по t.tests.<testKey>.questions[], тот
 * же приём, что и BODY_FIELDS в IntakeForm.
 */
export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({ testKey, auditToken, onResult }) => {
  const { t, lang } = useLanguage();
  const f = t.audit.form;
  const cp = t.corporate.publicAudit;
  const test = t.tests[testKey];
  const isLoyalty = testKey === 'loyalty';
  const questions: string[] = isLoyalty ? [t.tests.loyalty.ratingQuestion] : (test as { questions: string[] }).questions;
  const scaleMin = isLoyalty ? 0 : 1;
  const scaleMax = isLoyalty ? 10 : 5;

  const [form, setForm] = useState<QuestionnaireFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = <K extends keyof QuestionnaireFormState>(key: K, value: QuestionnaireFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const setAnswer = (questionId: number, value: number) => {
    setForm((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: value } }));
    setErrors((prev) => {
      const key = `q${questionId}`;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.department) next.department = f.required;
    if (!form.region) next.region = f.required;
    if (!form.gender) next.gender = f.required;

    const age = Number(form.age);
    if (!form.age || age < AGE_RANGE[0] || age > AGE_RANGE[1]) next.age = fillTemplate(f.rangeError, { min: AGE_RANGE[0], max: AGE_RANGE[1] });

    questions.forEach((_, idx) => {
      const id = idx + 1;
      if (form.answers[id] === undefined) next[`q${id}`] = f.required;
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await submitQuestionnaireResponse(auditToken, testKey, form, lang);
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
  const errorClass = 'text-[10px] sm:text-xs text-rose-500 mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      <fieldset className="space-y-3 sm:space-y-4">
        <legend className="text-sm sm:text-lg font-bold text-slate-900 mb-1">{f.sectionPersonal}</legend>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="col-span-2">
            <label className={labelClass}>{cp.departmentLabel}</label>
            <select value={form.department} onChange={(e) => set('department', e.target.value as QuestionnaireFormState['department'])} className={inputClass('department')}>
              <option value="">{cp.departmentPlaceholder}</option>
              {DEPARTMENT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {cp.departments[key]}
                </option>
              ))}
            </select>
            {errors.department && <p className={errorClass}>{errors.department}</p>}
          </div>

          <div className="col-span-2">
            <label className={labelClass}>{f.fields.region.label}</label>
            <select value={form.region} onChange={(e) => set('region', e.target.value as QuestionnaireFormState['region'])} className={inputClass('region')}>
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
        </div>
      </fieldset>

      <fieldset className="space-y-5 sm:space-y-6">
        <legend className="text-sm sm:text-lg font-bold text-slate-900 mb-1">{cp.questionsHeading}</legend>
        {questions.map((questionText, idx) => {
          const id = idx + 1;
          return (
            <div key={id}>
              <label className={labelClass}>{questionText}</label>
              <LikertScale
                min={scaleMin}
                max={scaleMax}
                value={form.answers[id] ?? null}
                onChange={(v) => setAnswer(id, v)}
                minLabel={isLoyalty ? t.tests.loyalty.ratingMinLabel : t.tests.likertScaleLabels[0]}
                maxLabel={isLoyalty ? t.tests.loyalty.ratingMaxLabel : t.tests.likertScaleLabels[4]}
                error={Boolean(errors[`q${id}`])}
              />
              {errors[`q${id}`] && <p className={errorClass}>{errors[`q${id}`]}</p>}
            </div>
          );
        })}

        {isLoyalty && (
          <div>
            <label className={labelClass}>{t.tests.loyalty.openTextLabel}</label>
            <textarea
              value={form.openText}
              onChange={(e) => set('openText', e.target.value)}
              placeholder={t.tests.loyalty.openTextPlaceholder}
              rows={3}
              className={inputClass('openText')}
            />
          </div>
        )}
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
