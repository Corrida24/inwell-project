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
            <div className="overflow-x-auto border border-sky-200 rounded-xl">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-sky-100 bg-sky-50/50 text-left text-slate-500">
                    <th className="px-3 py-2 font-semibold">{c.table.name}</th>
                    <th className="px-3 py-2 font-semibold whitespace-nowrap">{c.createAudit.testTypeLabel}</th>
                    <th className="px-3 py-2 font-semibold whitespace-nowrap">{c.table.deadline}</th>
                    <th className="px-3 py-2 font-semibold whitespace-nowrap">{c.table.responses}</th>
                    <th className="px-3 py-2 font-semibold whitespace-nowrap">{c.table.status}</th>
                    <th className="px-3 py-2 font-semibold text-right">{c.table.action}</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr key={a.id} className="border-b border-sky-100 last:border-0">
                      <td className="px-3 py-2.5 font-medium text-slate-900">{a.name}</td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{t.tests[a.testType].title}</td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{formatDate(a.deadline)}</td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                        {a.responseCount} / {a.maxResponses}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_BADGE[a.status]}`}>{c.status[a.status]}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {auditLimitReached && <p className="text-xs text-slate-400 mt-2">{c.auditLimitReached}</p>}
          </>
        )}
      </div>
    </section>
  );
};
