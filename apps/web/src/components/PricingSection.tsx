import React, { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Users2, Wallet, Info } from 'lucide-react';
import { useContactsModal } from './ContactsModalContext';
import { useLanguage, fillTemplate } from '../i18n/LanguageContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal } from './ui/Reveal';
import { LiveNumber } from './ui/AnimatedNumber';

const EMPLOYEE_PRESETS = [50, 100, 200, 300, 400, 500];
const FREE_THRESHOLD = 100;
const TIER2_THRESHOLD = 300; // 101–300: 100 000 / сотрудник
const TIER3_THRESHOLD = 499; // 301–499: 80 000 / сотрудник
// 500+ — индивидуально

interface BaseTier {
  rate: number | null;
  isFree: boolean;
  isIndividual: boolean;
}

function getBaseTier(count: number): BaseTier {
  if (count <= FREE_THRESHOLD) return { rate: 0, isFree: true, isIndividual: false };
  if (count <= TIER2_THRESHOLD) return { rate: 100000, isFree: false, isIndividual: false };
  if (count <= TIER3_THRESHOLD) return { rate: 80000, isFree: false, isIndividual: false };
  return { rate: null, isFree: false, isIndividual: true };
}

export const PricingSection: React.FC = () => {
  const { t } = useLanguage();
  const { open: openContacts } = useContactsModal();
  const p = t.pricing;

  const [empCount, setEmpCount] = useState(50);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const sum = (n: number) => `${Math.round(n).toLocaleString(p.numberLocale)} ${p.currency}`;

  const tier = useMemo(() => getBaseTier(empCount), [empCount]);
  const baseTotal = tier.isIndividual ? 0 : tier.isFree ? 0 : (tier.rate ?? 0) * empCount;

  const addonsTotal = useMemo(() => {
    return p.addons.reduce((acc, addon) => {
      if (!selected[addon.id]) return acc;
      return acc + (addon.unit === 'perEmployee' ? addon.price * empCount : addon.price);
    }, 0);
  }, [selected, p.addons, empCount]);

  const total = baseTotal + addonsTotal;
  const empPercent = (Math.min(empCount, 600) / 600) * 100;

  const toggleAddon = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section id="pricing" className="relative py-10 sm:py-20 bg-gradient-to-b from-sky-50 to-white border-b border-sky-100 overflow-hidden">
      <SectionGlow variant="teal" position="bottom" className="opacity-50" />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {p.headingPre}{' '}
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
              {p.headingHighlight}
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">{p.subtitle}</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="relative overflow-hidden bg-white rounded-2xl border border-sky-200 p-4 sm:p-7 shadow-sm">
            <div aria-hidden className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-teal-100/50 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-2 mb-4 sm:mb-6 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                  <Calculator className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-base font-bold text-slate-900 truncate">{p.calculatorTitle}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate">{p.calculatorSubtitle}</p>
                </div>
              </div>
              <span className="text-[9px] sm:text-[11px] font-semibold text-slate-500 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 shrink-0">
                {p.vatNote}
              </span>
            </div>

            {/* Summary — kept at the top of the block so the live total is
                visible without scrolling past employees/addons. min-w-0 on
                each cell + break-words on the value: without min-w-0 a grid
                item won't shrink below its content's intrinsic width, and
                ru-RU's thousands separator is a non-breaking space, so a
                sum like "20 000 000 сум" would otherwise overflow the
                narrow mobile column instead of wrapping. */}
            {tier.isIndividual ? (
              <div className="relative z-10 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-sky-50 border border-sky-200 text-center text-xs sm:text-sm text-slate-600">
                {p.individualNote}
              </div>
            ) : (
              <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-3 mb-4 sm:mb-6">
                <div className="min-w-0 p-1.5 sm:p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
                  <div className="text-[8px] sm:text-[11px] text-slate-500 truncate">{p.resultLabels.base}</div>
                  <div className="text-[11px] sm:text-base font-bold text-slate-800 break-words">
                    <LiveNumber value={baseTotal} format={sum} />
                  </div>
                </div>
                <div className="min-w-0 p-1.5 sm:p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
                  <div className="text-[8px] sm:text-[11px] text-slate-500 truncate">{p.resultLabels.addons}</div>
                  <div className="text-[11px] sm:text-base font-bold text-slate-800 break-words">
                    <LiveNumber value={addonsTotal} format={sum} />
                  </div>
                </div>
                <div className="min-w-0 p-1.5 sm:p-3 bg-teal-50 rounded-xl border border-teal-200 text-center">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal mx-auto mb-0.5 sm:mb-1" />
                  <div className="text-[8px] sm:text-[11px] text-slate-500 truncate">{p.resultLabels.total}</div>
                  <div className="text-[11px] sm:text-base font-bold text-brand-teal break-words">
                    <LiveNumber value={total} format={sum} />
                  </div>
                </div>
              </div>
            )}

            {/* Employees */}
            <div className="relative z-10 space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <span className="text-xs sm:text-sm text-slate-600">{p.employeesLabel}</span>
                <input
                  type="number"
                  min={1}
                  value={empCount}
                  onChange={(e) => setEmpCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 sm:w-24 text-right font-bold text-brand-blue text-sm sm:text-lg border border-sky-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
                />
              </div>
              <input
                type="range"
                min="1"
                max="600"
                step="1"
                value={Math.min(empCount, 600)}
                onChange={(e) => setEmpCount(Number(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer appearance-none"
                style={{
                  background: `linear-gradient(to right, #14b8a6 ${empPercent}%, #e0f2fe ${empPercent}%)`,
                }}
              />
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {EMPLOYEE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setEmpCount(preset)}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors ${
                      empCount === preset
                        ? 'bg-brand-teal text-white'
                        : 'bg-sky-50 text-slate-600 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Base audit tier */}
            <div className="relative z-10 mb-4 sm:mb-6 p-2.5 sm:p-4 rounded-xl border border-teal-200 bg-teal-50/60 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-slate-700">{p.baseSectionTitle}</span>
              {tier.isIndividual ? (
                <span className="text-xs sm:text-sm font-bold text-brand-blue break-words">{p.individualLabel}</span>
              ) : tier.isFree ? (
                <span className="text-xs sm:text-sm font-bold text-brand-teal break-words">{p.baseFreeLabel}</span>
              ) : (
                <span className="text-xs sm:text-sm font-bold text-brand-teal break-words">
                  {fillTemplate(p.baseTierNote, { rate: sum(tier.rate ?? 0) })}
                </span>
              )}
            </div>

            {tier.isIndividual && (
              <div className="relative z-10 mb-4 sm:mb-6 flex items-start gap-2 text-[10px] sm:text-xs text-slate-500 bg-sky-50 border border-sky-200 rounded-xl p-2.5 sm:p-3">
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-blue shrink-0 mt-0.5" />
                <span>{p.individualNote}</span>
              </div>
            )}

            {/* Addons */}
            <div className="relative z-10 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-2.5 sm:mb-3">{p.addonsSectionTitle}</p>
              <div className="space-y-1.5 sm:space-y-2">
                {p.addons.map((addon) => {
                  const lineTotal = addon.unit === 'perEmployee' ? addon.price * empCount : addon.price;
                  return (
                    <label
                      key={addon.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-colors ${
                        selected[addon.id] ? 'border-brand-teal bg-teal-50/60' : 'border-sky-200 hover:bg-sky-50'
                      }`}
                    >
                      <span className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={!!selected[addon.id]}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-brand-teal shrink-0 mt-0.5 sm:mt-0"
                        />
                        <span className="text-xs sm:text-sm text-slate-700">{addon.title}</span>
                      </span>
                      <span className="text-[10px] sm:text-sm font-semibold text-slate-600 text-left sm:text-right shrink-0 pl-5 sm:pl-0 break-words">
                        {addon.unit === 'perEmployee' ? (
                          <>
                            {sum(addon.price)} {p.perEmployeeSuffix}
                            {selected[addon.id] && (
                              <span className="block text-brand-teal">{sum(lineTotal)}</span>
                            )}
                          </>
                        ) : (
                          sum(addon.price)
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 flex items-start gap-2 text-[9px] sm:text-[11px] text-slate-400 mb-4 sm:mb-6">
              <Users2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5" />
              <span>{p.termsTitle}: {p.termsNote}</span>
            </div>

            <div className="relative z-10 text-center">
              <button
                onClick={openContacts}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-xs sm:text-sm rounded-xl inline-flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              >
                <span>{total === 0 ? p.ctaFree : p.ctaContact}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
