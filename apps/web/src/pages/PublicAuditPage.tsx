import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fillTemplate, useLanguage } from '../i18n/LanguageContext';
import { IntakeForm } from '../audit/IntakeForm';
import { Footer } from '../components/Footer';
import { getPublicAuditInfo, type PublicAuditInfo, type SubmitResult } from '../audit/api';
import { REPORT_STORAGE_KEY, REPORT_SOURCE_KEY } from '../audit/reportStorage';

/**
 * /a/:token — публичная страница корпоративного опросника, без логина.
 * Переиспользует IntakeForm (mode="corporate") и, после отправки,
 * /personal/report для показа результата — та же форма, тот же отчёт, что и
 * у personal-пользователей (см. IntakeForm.tsx / reportStorage.ts).
 */
export const PublicAuditPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useLanguage();
  const cp = t.corporate.publicAudit;
  const navigate = useNavigate();

  const [info, setInfo] = useState<PublicAuditInfo | null | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getPublicAuditInfo(token)
      .then((res) => {
        if (!cancelled) setInfo(res);
      })
      .catch(() => {
        if (!cancelled) setInfo(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResult = (result: SubmitResult) => {
    sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(result));
    sessionStorage.setItem(REPORT_SOURCE_KEY, 'corporate');
    navigate('/personal/report');
  };

  if (info === undefined) {
    return (
      <section className="pt-32 pb-20 text-center px-5">
        <p className="text-slate-400 text-sm">{cp.loading}</p>
      </section>
    );
  }

  if (info === null) {
    return (
      <section className="pt-32 pb-20 text-center px-5">
        <p className="text-slate-600 text-sm">{cp.notFound}</p>
      </section>
    );
  }

  if (info.status === 'expired') {
    return (
      <section className="pt-32 pb-20 text-center px-5">
        <p className="text-slate-600 text-sm">{cp.expired}</p>
      </section>
    );
  }

  if (info.status === 'full') {
    return (
      <section className="pt-32 pb-20 text-center px-5">
        <p className="text-slate-600 text-sm">{cp.full}</p>
      </section>
    );
  }

  return (
    <>
      <section className="pt-20 pb-10 sm:pt-32 sm:pb-20 bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-5 sm:mb-8">
            <h1 className="text-lg sm:text-3xl font-bold text-slate-900 mb-1.5 sm:mb-2">{fillTemplate(cp.invitedBy, { company: info.companyName })}</h1>
            <p className="text-xs sm:text-sm text-slate-500">{t.audit.form.subtitle}</p>
          </div>
          <IntakeForm mode="corporate" auditToken={token} onResult={handleResult} />
        </div>
      </section>
      <Footer />
    </>
  );
};
