import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { createAudit, CorporateApiError } from '../corporate/api';
import type { AuditListItem } from '../corporate/types';

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const CorporateCreateAuditPage: React.FC = () => {
  const { t } = useLanguage();
  const c = t.corporate.createAudit;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxResponses, setMaxResponses] = useState('20');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<AuditListItem | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = c.required;
    if (!deadline) next.deadline = c.required;
    else if (deadline < todayStr()) next.deadline = c.deadlinePast;
    const n = Number(maxResponses);
    if (!maxResponses || !Number.isInteger(n) || n < 1) next.maxResponses = c.required;
    else if (n > 100) next.maxResponses = c.maxResponsesTooBig;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { audit } = await createAudit({ name: name.trim(), deadline, maxResponses: Number(maxResponses), comment: comment.trim() || undefined });
      setCreated(audit);
    } catch (err) {
      if (err instanceof CorporateApiError && err.code === 'audit_limit_reached') {
        setServerError(t.corporate.auditLimitReached);
      } else if (err instanceof CorporateApiError && err.fieldErrors) {
        setServerError(c.maxResponsesTooBig);
      } else {
        setServerError(t.corporate.errors.generic);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (key: string) =>
    `w-full px-3 py-2 rounded-lg border bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition-colors ${
      errors[key] ? 'border-rose-400' : 'border-sky-200 focus:border-brand-teal'
    }`;
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';
  const errorClass = 'text-xs text-rose-500 mt-1';

  if (created) {
    // От текущего домена приложения (а не захардкоженного prod-домена) —
    // иначе локальный/staging-стенд генерирует ссылку на другой сайт.
    const link = `${window.location.origin}/a/${created.publicToken}`;
    const copyLink = () => {
      navigator.clipboard?.writeText(link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    return (
      <section className="min-h-screen px-5 pt-20 pb-10 bg-white">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-bold text-slate-900 mb-4">{c.createdTitle}</h1>
          <div className="border border-sky-200 rounded-xl p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">{c.linkLabel}</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 truncate text-sm text-slate-900 bg-sky-50 border border-sky-100 rounded-lg px-2.5 py-1.5">{link}</code>
                <button
                  onClick={copyLink}
                  className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-light transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? c.copied : c.copyLink}</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">{c.shareNote}</p>
          </div>
          <Link to="/corporate/dashboard" className="inline-flex mt-5 text-sm font-semibold text-brand-blue hover:text-brand-teal transition-colors">
            {c.backToDashboard}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-5 pt-20 pb-10 bg-white">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/corporate/dashboard')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>{c.back}</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 mb-5">{c.title}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{c.nameLabel}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={c.namePlaceholder} className={inputClass('name')} />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>{c.deadlineLabel}</label>
            <input type="date" min={todayStr()} value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass('deadline')} />
            {errors.deadline && <p className={errorClass}>{errors.deadline}</p>}
          </div>

          <div>
            <label className={labelClass}>{c.maxResponsesLabel}</label>
            <input type="number" min={1} max={100} value={maxResponses} onChange={(e) => setMaxResponses(e.target.value)} className={inputClass('maxResponses')} />
            <p className="text-xs text-slate-400 mt-1">{c.maxResponsesHint}</p>
            {errors.maxResponses && <p className={errorClass}>{errors.maxResponses}</p>}
          </div>

          <div>
            <label className={labelClass}>{c.commentLabel}</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={c.commentPlaceholder} rows={3} className={inputClass('comment')} />
          </div>

          {serverError && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">{serverError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {submitting ? c.submitting : c.submit}
          </button>
        </form>
      </div>
    </section>
  );
};
