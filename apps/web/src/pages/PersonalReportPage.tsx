import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { REPORT_STORAGE_KEY, REPORT_SOURCE_KEY, type ReportSource } from '../audit/reportStorage';
import { ReportView } from '../audit/ReportView';
import type { SubmitResult } from '../audit/api';

// ---------------------------------------------------------------------------
// Эта страница отвечает только за загрузку результата из sessionStorage
// (передан с /personal/start или /a/:token) и за состояние "нет результата".
// Вся визуальная часть отчёта живёт в <ReportView> (см. ../audit/ReportView),
// который используется тут и на /example — так дизайн не может разойтись.
// ---------------------------------------------------------------------------

export const PersonalReportPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const r = t.audit.report;
  const [result, setResult] = useState<SubmitResult | null | undefined>(undefined);
  const [source, setSource] = useState<ReportSource>('personal');
  const [saving, setSaving] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(REPORT_STORAGE_KEY);
    setResult(raw ? (JSON.parse(raw) as SubmitResult) : null);
    const src = sessionStorage.getItem(REPORT_SOURCE_KEY);
    setSource(src === 'corporate' ? 'corporate' : 'personal');
  }, []);
  const isCorporateSource = source === 'corporate';

  // "Сохранить" — просто скриншот всей страницы отчёта в PNG (не отдельный
  // механизм красивой печатной версии — так и попросили: "просто чтоб человек
  // мог сохранить в виде картинки"). Плавающая кнопка сама исключается из
  // снимка через ignoreElements, чтобы не попасть в картинку.
  const handleSave = async () => {
    if (!captureRef.current || saving) return;
    setSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        useCORS: true,
        ignoreElements: (el) => el === saveButtonRef.current,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const dateStamp = new Date().toISOString().slice(0, 10);
      link.href = dataUrl;
      link.download = `inwell-report-${dateStamp}.png`;
      link.click();
    } catch (e) {
      console.error('Failed to save report as image', e);
    } finally {
      setSaving(false);
    }
  };

  if (result === undefined) return null;

  if (!result) {
    return (
      <section className="pt-32 pb-20 text-center px-5">
        <p className="text-slate-600 mb-4">{r.empty}</p>
        <button
          onClick={() => navigate('/personal/start')}
          className="inline-flex px-6 py-3 rounded-xl text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-light transition-all"
        >
          {r.goToForm}
        </button>
      </section>
    );
  }

  return (
    <>
      <div ref={captureRef}>
        <ReportView result={result} isCorporateSource={isCorporateSource} />
      </div>

      {/* Плавающая кнопка "Сохранить" — всегда видна внизу по центру. */}
      <div ref={saveButtonRef} className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-900/30 active:scale-95 transition-all disabled:opacity-70"
        >
          <Download className="w-5 h-5" />
          <span>{saving ? r.savingImage : r.saveFloating}</span>
        </button>
      </div>
    </>
  );
};
