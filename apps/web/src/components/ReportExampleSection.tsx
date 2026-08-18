import React from 'react';
import { ShieldCheck, Users, UserCheck, AlertTriangle, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal } from './ui/Reveal';
import { CircleGauge } from './ui/CircleGauge';
import { PercentileBar } from './ui/PercentileBar';
import { MiniBarChart } from './ui/MiniBarChart';

const CORPORATE_DATA = { coverage: 120, completedPercent: 87, wellfitIndex: 82, riskZonePercent: 14 };

export const ReportExampleSection: React.FC = () => {
  const { t } = useLanguage();
  const r = t.reportExample;

  return (
    <section id="report-example" className="relative py-10 sm:py-20 bg-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="blue" className="opacity-60" />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-slate-700 text-xs font-semibold uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" /> {r.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {r.headingPre}{' '}
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
              {r.headingHighlight}
            </span>{' '}
            {r.headingPost}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{r.subtitle}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="bg-white border border-sky-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-3.5 sm:px-5 py-3 sm:py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-teal-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2 sm:mb-3">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                <span>{r.cardTitle}</span>
              </div>

              {/* Mock/demo dropdown filters — visual only, not functional */}
              <div className="flex flex-wrap gap-1.5">
                {r.filters.map((filter) => (
                  <span
                    key={filter}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-sky-200 text-slate-500 text-[11px] sm:text-xs font-medium"
                  >
                    {filter}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <p className="font-bold text-slate-900 text-sm sm:text-base">{r.corporateTitle}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-5 items-center">
                <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <Users className="w-5 h-5 text-brand-blue" />
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">{CORPORATE_DATA.coverage}</div>
                  <div className="text-[11px] sm:text-xs text-slate-500 text-center">{r.coverageLabel}</div>
                </div>

                <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <UserCheck className="w-5 h-5 text-brand-teal" />
                  <div className="text-xl sm:text-2xl font-bold text-brand-teal">{CORPORATE_DATA.completedPercent}%</div>
                  <div className="text-[11px] sm:text-xs text-slate-500 text-center">{r.completedLabel}</div>
                </div>

                <div className="flex flex-col items-center">
                  <CircleGauge
                    value={CORPORATE_DATA.wellfitIndex}
                    size={100}
                    label={`${CORPORATE_DATA.wellfitIndex}`}
                    sublabel="/ 100"
                    colorClassName="stroke-brand-teal"
                    valueClassName="text-brand-teal"
                  />
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-1 text-center">{r.indexLabel}</div>
                </div>

                <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <div className="text-xl sm:text-2xl font-bold text-rose-600">{CORPORATE_DATA.riskZonePercent}%</div>
                  <div className="text-[11px] sm:text-xs text-slate-500 text-center">{r.riskLabel}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-1 sm:pt-2">
                <div className="p-3.5 sm:p-5 bg-white border border-sky-200 rounded-xl">
                  <p className="text-sm font-semibold text-slate-800 mb-2.5 sm:mb-3">{r.deptChartTitle}</p>
                  <MiniBarChart data={r.departmentBreakdown} />
                </div>
                <div className="p-3.5 sm:p-5 bg-white border border-sky-200 rounded-xl flex flex-col justify-center">
                  <p className="text-sm font-semibold text-slate-800 mb-2.5 sm:mb-3">{r.percentileTitleCorp}</p>
                  <PercentileBar percent={68} note={r.corporatePercentileNote} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1 sm:pt-2">
                <div className="p-3.5 sm:p-4 bg-sky-50 rounded-xl border border-sky-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 sm:mb-2.5">{r.keyIndicatorsTitle}</p>
                  <div className="space-y-1.5">
                    {r.keyIndicators.map((k) => (
                      <div key={k.label} className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{k.label}</span>
                        <span className="font-semibold text-slate-800">{k.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-rose-50 rounded-xl border border-rose-100">
                  <p className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-2 sm:mb-2.5">{r.riskZonesTitle}</p>
                  <ul className="space-y-1.5">
                    {r.riskZonesList.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-sm text-slate-700">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 sm:p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-2 sm:mb-2.5">{r.strengthsTitle}</p>
                  <ul className="space-y-1.5">
                    {r.strengthsList.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">{r.corpFootnote}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
