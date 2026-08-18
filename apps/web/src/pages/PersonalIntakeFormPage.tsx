import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { IntakeForm } from '../audit/IntakeForm';
import { Footer } from '../components/Footer';
import { useLanguage } from '../i18n/LanguageContext';
import type { SubmitResult } from '../audit/api';
import { REPORT_STORAGE_KEY, REPORT_SOURCE_KEY } from '../audit/reportStorage';

/** /personal/start — the data-entry form as its own page (not a section of
 * the landing page, per the brief). On success the report is handed to the
 * report page via sessionStorage (survives a page load, unlike React state
 * across a route change) and we navigate there. */
export const PersonalIntakeFormPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleResult = (result: SubmitResult) => {
    sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(result));
    sessionStorage.setItem(REPORT_SOURCE_KEY, 'personal');
    navigate('/personal/report');
  };

  return (
    <>
      <section className="pt-20 pb-10 sm:pt-32 sm:pb-20 bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          <Link
            to="/personal"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t.common.back}</span>
          </Link>
          <div className="text-center mb-5 sm:mb-8">
            <h1 className="text-lg sm:text-3xl font-bold text-slate-900 mb-1.5 sm:mb-2">{t.audit.form.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500">{t.audit.form.subtitle}</p>
          </div>
          <IntakeForm onResult={handleResult} />
        </div>
      </section>
      <Footer />
    </>
  );
};
