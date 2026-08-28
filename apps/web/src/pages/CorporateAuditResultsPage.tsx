import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage, fillTemplate } from '../i18n/LanguageContext';
import { getAuditResults, CorporateApiError } from '../corporate/api';
import type { AuditResultsResponse, GroupAggregate, CompositionBreakdown } from '../corporate/types';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  full: 'bg-slate-100 text-slate-600 border-slate-200',
  expired: 'bg-rose-50 text-rose-600 border-rose-200',
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export const CorporateAuditResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const c = t.corporate.results;

  const [data, setData] = useState<AuditResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [department, setDepartment] = useState('');
  const [gender, setGender] = useState('');
  const [region, setRegion] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [office, setOffice] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getAuditResults(id, { department, gender, region, ageBand, office }, lang);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof CorporateApiError ? err.message : t.corporate.errors.generic);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, department, gender, region, ageBand, office, lang]);

  if (error) {
    return (
      <section className="min-h-screen px-5 pt-20 pb-10 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">{error}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="min-h-screen px-5 pt-20 pb-10 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-slate-400">{t.corporate.loading}</p>
        </div>
      </section>
    );
  }

  const { audit } = data;

  if (data.insufficientData) {
    return (
      <section className="min-h-screen px-5 pt-20 pb-14 bg-white">
        <div className="max-w-3xl mx-auto">
          <Link to="/corporate/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>{c.back}</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-900 mb-3">{audit.name}</h1>
          <div className="border border-sky-200 rounded-xl p-6 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-700">{c.insufficientDataTitle}</p>
            <p className="text-sm text-slate-500">{fillTemplate(c.insufficientDataText, { count: data.responseCount, min: data.minRequired })}</p>
          </div>
        </div>
      </section>
    );
  }

  const { aggregation } = data;
  const selectClass =
    'px-2.5 py-1.5 rounded-lg border border-sky-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

  const departmentLabel = (key: string) => t.corporate.publicAudit.departments[key as keyof typeof t.corporate.publicAudit.departments] ?? key;
  const regionLabel = (key: string) => t.audit.form.regions[key as keyof typeof t.audit.form.regions] ?? key;

  function MetricsTable({ groups, allLabel, headlineLabel }: { groups: GroupAggregate[]; allLabel?: string; headlineLabel: string }) {
    return (
      <div className="overflow-x-auto border border-sky-200 rounded-xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-sky-100 bg-sky-50/50 text-left text-slate-500">
              <th className="px-3 py-2 font-semibold whitespace-nowrap">{c.tableMetric}</th>
              {groups.map((g) => (
                <th key={g.key} className="px-3 py-2 font-semibold text-right whitespace-nowrap">
                  {g.key === 'all' ? allLabel ?? c.tableAll : g.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-sky-100">
              <td className="px-3 py-2 text-slate-600">{c.tableParticipants}</td>
              {groups.map((g) => (
                <td key={g.key} className="px-3 py-2 text-right font-semibold text-slate-900">
                  {g.participantCount}
                </td>
              ))}
            </tr>
            <tr className="border-b border-sky-100">
              <td className="px-3 py-2 text-slate-600">{headlineLabel}</td>
              {groups.map((g) => (
                <td key={g.key} className="px-3 py-2 text-right font-semibold text-slate-900">
                  {g.averageScore ?? '—'}
                </td>
              ))}
            </tr>
            {groups[0]?.metrics.map((m, idx) => (
              <tr key={m.key} className={idx === groups[0].metrics.length - 1 ? '' : 'border-b border-sky-100'}>
                <td className="px-3 py-2 text-slate-600">
                  {m.label} <span className="text-slate-400">({m.unit || '—'})</span>
                </td>
                {groups.map((g) => {
                  const gm = g.metrics.find((x) => x.key === m.key);
                  const topDist = gm?.distribution?.[0];
                  return (
                    <td key={g.key} className="px-3 py-2 text-right whitespace-nowrap">
                      <span className="font-semibold text-slate-900">{gm?.average ?? '—'}</span>
                      {topDist && (
                        <span className="text-slate-400 text-[11px] ml-1">
                          ({topDist.label} {topDist.pct}%)
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function CompositionList({ items, noDataLabel }: { items: CompositionBreakdown[]; noDataLabel: string }) {
    if (items.length === 0) {
      return <p className="text-xs text-slate-400">{noDataLabel}</p>;
    }
    return (
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.key} className="flex items-center justify-between text-xs">
            <span className="text-slate-600">{it.label}</span>
            <span className="font-semibold text-slate-900">
              {it.count} <span className="text-slate-400 font-normal">({it.pct}%)</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }

  const compositionDepartment = aggregation.composition.department.map((d) => ({ ...d, label: departmentLabel(d.key) }));
  const compositionRegion = aggregation.composition.region.map((r) => ({ ...r, label: regionLabel(r.key) }));

  return (
    <section className="min-h-screen px-5 pt-20 pb-14 bg-white">
      <div className="max-w-5xl mx-auto">
        <Link to="/corporate/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-blue transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>{c.back}</span>
        </Link>

        <h1 className="text-lg font-bold text-slate-900 mb-3">{audit.name}</h1>

        {/* Общая информация — компактная строка, не карточки на весь экран */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm border border-sky-200 rounded-xl px-4 py-3 mb-5">
          <div>
            <span className="text-slate-400">{c.participants}: </span>
            <span className="font-semibold text-slate-900">{audit.responseCount}</span>
          </div>
          <div>
            <span className="text-slate-400">{c.responsesOfLimit}: </span>
            <span className="font-semibold text-slate-900">
              {audit.responseCount} / {audit.maxResponses}
            </span>
          </div>
          <div>
            <span className="text-slate-400">{c.statusLabel}: </span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_BADGE[audit.status]}`}>{t.corporate.status[audit.status]}</span>
          </div>
          <div>
            <span className="text-slate-400">{c.deadlineLabel}: </span>
            <span className="font-semibold text-slate-900">{formatDate(audit.deadline)}</span>
          </div>
        </div>

        <>
          {/* Фильтры — компактные select в один ряд: Город, Офис, Пол, Возраст, Отдел */}
          <div className="flex flex-wrap gap-2 mb-6">
              <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectClass}>
                <option value="">{c.filters.allRegions}</option>
                {aggregation.availableFilters.regions.map((r) => (
                  <option key={r} value={r}>
                    {regionLabel(r)}
                  </option>
                ))}
              </select>
              <select value={office} onChange={(e) => setOffice(e.target.value)} className={selectClass} disabled={aggregation.availableFilters.offices.length === 0}>
                <option value="">{c.filters.allOffices}</option>
                {aggregation.availableFilters.offices.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
                <option value="">{c.filters.allGenders}</option>
                {aggregation.availableFilters.genders.map((g) => (
                  <option key={g} value={g}>
                    {g === 'M' ? c.filters.male : c.filters.female}
                  </option>
                ))}
              </select>
              <select value={ageBand} onChange={(e) => setAgeBand(e.target.value)} className={selectClass}>
                <option value="">{c.filters.allAges}</option>
                {aggregation.availableFilters.ageBands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className={selectClass}>
                <option value="">{c.filters.allDepartments}</option>
                {aggregation.availableFilters.departments.map((d) => (
                  <option key={d} value={d}>
                    {departmentLabel(d)}
                  </option>
                ))}
              </select>
            </div>

            {aggregation.participantCount === 0 ? (
              <p className="text-sm text-slate-400">{c.emptyTitle}</p>
            ) : (
              <div className="space-y-8">
                {/* 1. Общая картина компании */}
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-2">{c.overallPictureTitle}</h2>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm border border-sky-200 rounded-xl px-4 py-3 mb-3">
                    <div>
                      <span className="text-slate-400">{c.participants}: </span>
                      <span className="font-bold text-slate-900">{aggregation.participantCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">{c.averageScore}: </span>
                      <span className="font-bold text-slate-900">{aggregation.overall.averageScore ?? '—'}</span>
                      <span className="text-slate-400"> / 100</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-700 mb-1.5">{c.positiveTitle}</p>
                      {aggregation.positiveHighlights.length === 0 ? (
                        <p className="text-xs text-slate-400">{c.noHighlights}</p>
                      ) : (
                        <ul className="space-y-1">
                          {aggregation.positiveHighlights.map((h) => (
                            <li key={h.key} className="text-xs text-slate-700">
                              {h.label} — <span className="font-semibold">{h.pct}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="border border-amber-200 bg-amber-50/40 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1.5">{c.attentionTitle}</p>
                      {aggregation.attentionHighlights.length === 0 ? (
                        <p className="text-xs text-slate-400">{c.noHighlights}</p>
                      ) : (
                        <ul className="space-y-1">
                          {aggregation.attentionHighlights.map((h) => (
                            <li key={h.key} className="text-xs text-slate-700">
                              {h.label} — <span className="font-semibold">{h.pct}%</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Состав участников */}
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-2">{c.compositionTitle}</h2>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="border border-sky-200 rounded-xl px-3.5 py-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">{c.compositionGender}</p>
                      <CompositionList items={aggregation.composition.gender} noDataLabel={c.compositionNoData} />
                    </div>
                    <div className="border border-sky-200 rounded-xl px-3.5 py-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">{c.compositionAge}</p>
                      <CompositionList items={aggregation.composition.ageBand} noDataLabel={c.compositionNoData} />
                    </div>
                    <div className="border border-sky-200 rounded-xl px-3.5 py-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">{c.compositionDepartment}</p>
                      <CompositionList items={compositionDepartment} noDataLabel={c.compositionNoData} />
                    </div>
                    <div className="border border-sky-200 rounded-xl px-3.5 py-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">{c.compositionCity}</p>
                      <CompositionList items={compositionRegion} noDataLabel={c.compositionNoData} />
                    </div>
                  </div>
                </div>

                {/* 3 + 4. Основные показатели + распределение по категориям (в одной таблице — среднее и % в скобках) */}
                <div>
                  <h2 className="text-sm font-bold text-slate-900 mb-2">{c.metricsHeading}</h2>
                  <MetricsTable groups={[aggregation.overall]} allLabel={c.tableAll} headlineLabel={aggregation.headlineLabel} />
                  <p className="text-[11px] text-slate-400 mt-1.5">{c.distributionNote}</p>
                </div>

                {/* 5. Анализ по отделам */}
                {aggregation.byDepartment.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-2">{c.departmentsHeading}</h2>
                    <MetricsTable groups={[aggregation.overall, ...aggregation.byDepartment]} allLabel={c.tableAll} headlineLabel={aggregation.headlineLabel} />
                  </div>
                )}

                {/* 6. Анализ по полу */}
                {aggregation.byGender.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-2">{c.byGenderTitle}</h2>
                    <MetricsTable groups={aggregation.byGender} headlineLabel={aggregation.headlineLabel} />
                  </div>
                )}

                {/* 7. Анализ по возрасту */}
                {aggregation.byAgeBand.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 mb-2">{c.byAgeTitle}</h2>
                    <MetricsTable groups={aggregation.byAgeBand} headlineLabel={aggregation.headlineLabel} />
                  </div>
                )}
              </div>
            )}
        </>
      </div>
    </section>
  );
};
