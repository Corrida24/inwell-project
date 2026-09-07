import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, Copy, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCorporateAuth } from '../corporate/AuthContext';
import { getMyCompany, listAudits, CorporateApiError } from '../corporate/api';
import type { Company, AuditListItem } from '../corporate/types';

const STATUS_BADGE: Record<AuditListItem['status'], string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  full: 'bg-slate-100 text-slate-600 border-slate-200',
  expired: 'bg-rose-50 text-rose-600 border-rose-200',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** Компактный рабочий дашборд, не маркетинг: название/ИНН компании сверху,
 * таблица аудитов ниже. Минимум декоративных элементов по ТЗ. */
export const CorporateDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const c = t.corporate;
  const { signOut } = useCorporateAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [audits, setAudits] = useState<AuditListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyAuditLink = (audit: AuditListItem) => {
    // От текущего домена приложения — та же логика, что и на странице
    // создания аудита, чтобы ссылку можно было скопировать повторно, если
    // её потеряли/закрыли сразу после создания.
    const link = `${window.location.origin}/a/${audit.publicToken}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopiedId(audit.id);
    setTimeout(() => setCopiedId((cur) => (cur === audit.id ? null : cur)), 1500);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [companyRes, auditsRes] = await Promise.all([getMyCompany(), listAudits()]);
        if (cancelled) return;
        setCompany(companyRes);
        setAudits(auditsRes.audits);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof CorporateApiError ? err.message : c.errors.generic);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const auditLimitReached = (audits?.length ?? 0) >= 10;

  return (
    <section className="min-h-screen px-5 pt-20 pb-10 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{company?.name ?? c.dashboardTitle}</h1>
            {company && (
              <p className="text-xs text-slate-500 mt-0.5">
                {c.companyInnLabel}: {company.inn}
              </p>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{c.logout}</span>
          </button>
        </div>

        {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">{c.auditsHeading}</h2>
          {!auditLimitReached ? (
            <Link
              to="/corporate/audits/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-light transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{c.createAuditCta}</span>
            </Link>
          ) : null}
        </div>

        {audits === null ? (
          <p className="text-sm text-slate-400">{c.loading}</p>
        ) : audits.length === 0 ? (
          <div className="border border-sky-200 rounded-xl p-6 text-center space-y-3">
            <p className="text-sm text-slate-500">{c.noAudits}</p>
            <Link
              to="/corporate/audits/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{c.createAuditCta}</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Карточки вместо широкой 6-колоночной таблицы — раньше кнопку
                "Посмотреть результаты" было видно только промотав таблицу
                вбок ("нужно перематывать кубик"). Каждая карточка сразу
                показывает и название, и заполненность, и обе кнопки — без
                горизонтального скролла на любой ширине экрана. */}
            <div className="space-y-3">
              {audits.map((a) => {
                const pct = a.maxResponses > 0 ? Math.min(100, Math.round((a.responseCount / a.maxResponses) * 100)) : 0;
                return (
                  <div key={a.id} className="border border-sky-200 rounded-xl px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{a.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.tests[a.testType].title}</p>
                      </div>
                      <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${STATUS_BADGE[a.status]}`}>
                        {c.status[a.status]}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{c.table.responses}</span>
                        <span className="font-semibold text-slate-700">
                          {a.responseCount} / {a.maxResponses}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs">
                      <span className="text-slate-500">
                        {c.table.deadline}: <span className="font-semibold text-slate-700">{formatDate(a.deadline)}</span>
                      </span>
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => copyAuditLink(a)}
                          className="inline-flex items-center gap-1 text-slate-500 font-semibold hover:text-brand-blue transition-colors"
                        >
                          {copiedId === a.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === a.id ? c.createAudit.copied : c.createAudit.copyLink}</span>
                        </button>
                        <Link to={`/corporate/audits/${a.id}`} className="text-brand-blue font-semibold hover:text-brand-teal transition-colors">
                          {c.table.viewResults}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {auditLimitReached && <p className="text-xs text-slate-400 mt-2">{c.auditLimitReached}</p>}
          </>
        )}
      </div>
    </section>
  );
};
