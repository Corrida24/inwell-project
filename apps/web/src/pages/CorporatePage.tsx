import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  Brain,
  Heart,
  Apple,
  Moon,
  Zap,
  ClipboardList,
  Send,
  EyeOff,
  BarChart3,
  Lock,
  Clock,
  Sparkles,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactsModal } from '../components/ContactsModalContext';
import { SectionGlow } from '../components/ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from '../components/ui/Reveal';
import { FaqItem } from '../components/ui/FaqAccordion';
import { ContactsSection } from '../components/ContactsSection';
import { Footer } from '../components/Footer';

const DIMENSION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  physical: Activity,
  mental: Brain,
  satisfaction: Heart,
  sleep: Moon,
};

const PROBLEM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  physical: Activity,
  mental: Brain,
  satisfaction: Heart,
  stress: Zap,
};

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  create: ClipboardList,
  send: Send,
  collect: EyeOff,
  analyze: BarChart3,
};

const MODULE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  fitAudit: Activity,
  mental: Brain,
  satisfaction: Heart,
  nutrition: Apple,
  sleep: Moon,
};

const TRUST_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  anonymous: EyeOff,
  confidential: Lock,
  aggregated: BarChart3,
};

const TIME_TO_VALUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  launch: Zap,
  live: Radio,
  validation: ShieldCheck,
};

/**
 * /corporate — визуальный bento-лендинг платформы Inwell (рефакторинг по
 * явному запросу: "kill the text walls", текст → UI). Ни один блок текста
 * не превышает 1-2 коротких предложений — концепции показаны карточками,
 * bento-грид модулей, мини-дашборд-мокапом в hero и flowchart'ом "как это
 * работает", а не абзацами. Полноценный длинный лендинг конкретно про Fit
 * Audit (с деталями, тарифами, FAQ) не удалён — он живёт на
 * /corporate/fit-audit (см. FitAuditLandingPage.tsx) и открывается по
 * клику на акцентную карточку модуля ниже.
 */
export const CorporatePage: React.FC = () => {
  const { t } = useLanguage();
  const { open: openContacts } = useContactsModal();
  const cp = t.corporatePlatform;
  const h = cp.hero;
  const [liveModule, ...soonModules] = cp.modules;

  return (
    <>
      {/* 1. HERO — заголовок-обещание + мини-мокап дашборда вместо текста */}
      <section className="relative pt-20 pb-10 sm:pt-32 sm:pb-16 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50/30">
        <SectionGlow variant="blue" />
        <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
            <div className="text-center lg:text-left space-y-3.5 sm:space-y-5">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-sky-200 shadow-sm text-slate-700 text-xs sm:text-sm font-medium">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-teal animate-pulse" />
                <span>{h.badge}</span>
              </div>

              <h1 className="text-[32px] leading-[1.1] sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                {h.titleLine1}
                <br />
                <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
                  {h.titleHighlight}
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 max-w-md mx-auto lg:mx-0">{h.subtitle}</p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-bold">
                {h.pilotBadge}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
                <button
                  onClick={openContacts}
                  className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>{h.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/corporate/fit-audit"
                  className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-sky-50 text-slate-800 font-semibold text-sm border border-sky-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Activity className="w-4 h-4 text-brand-teal" />
                  <span>{h.ctaSecondary}</span>
                </Link>
              </div>
            </div>

            {/* Мини-мокап дашборда — вместо абзаца, показываем 4 направления платформы визуально */}
            <div className="hidden lg:block">
              <div className="bg-white border border-sky-200 rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-sky-100 bg-slate-50/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-2 text-[11px] font-semibold text-slate-400">{h.dashboardLabel}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    {h.dimensions.map((d, idx) => {
                      const Icon = DIMENSION_ICONS[d.key] ?? Activity;
                      return (
                        <React.Fragment key={d.key}>
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
                              <Icon className="w-4.5 h-4.5 text-brand-teal" />
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">{d.label}</span>
                          </div>
                          {idx < h.dimensions.length - 1 && <span className="flex-1 h-px bg-sky-200 mx-1 mb-4" />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="bg-sky-50/70 border border-sky-100 rounded-lg h-14 flex items-end p-2">
                      <div className="w-full flex items-end gap-1 h-8">
                        <span className="flex-1 bg-brand-teal/40 rounded-sm" style={{ height: '45%' }} />
                        <span className="flex-1 bg-brand-teal/60 rounded-sm" style={{ height: '70%' }} />
                        <span className="flex-1 bg-brand-teal rounded-sm" style={{ height: '95%' }} />
                      </div>
                    </div>
                    <div className="bg-sky-50/70 border border-sky-100 rounded-lg h-14 flex items-center justify-center">
                      <span className="text-lg font-extrabold text-slate-900">72</span>
                    </div>
                    <div className="bg-sky-50/70 border border-sky-100 rounded-lg h-14 flex items-center justify-center">
                      <span className="w-7 h-7 rounded-full border-4 border-brand-teal border-r-sky-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 TIME-TO-VALUE — скорость и достоверность, компактный ряд из 3 карточек */}
      <section className="py-6 sm:py-10 bg-white border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <RevealStagger className="grid grid-cols-3 gap-2 sm:gap-4">
            {cp.timeToValue.items.map((item) => {
              const Icon = TIME_TO_VALUE_ICONS[item.key] ?? Zap;
              return (
                <RevealItem key={item.key}>
                  <div className="h-full flex flex-col items-center text-center gap-1.5 sm:gap-2 bg-sky-50/60 border border-sky-100 rounded-xl p-3 sm:p-4">
                    <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border border-sky-200 flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-brand-teal" />
                    </span>
                    <span className="text-[11px] sm:text-sm font-bold text-slate-800 leading-tight">{item.title}</span>
                    <span className="text-[10px] sm:text-xs text-slate-500 leading-snug hidden sm:block">{item.desc}</span>
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      {/* 2. THE PROBLEM — 4 минималистичные карточки, без текста-объяснения */}
      <section className="py-8 sm:py-14 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-5 sm:mb-8">
            <h2 className="text-base sm:text-xl font-bold text-slate-900">{cp.problem.title}</h2>
          </Reveal>
          <RevealStagger className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {cp.problem.items.map((item) => {
              const Icon = PROBLEM_ICONS[item.key] ?? Activity;
              return (
                <RevealItem key={item.key}>
                  <div className="flex flex-col items-center text-center gap-2 bg-slate-50/70 border border-slate-200 rounded-2xl py-5 px-3">
                    <span className="w-11 h-11 rounded-xl bg-white border border-sky-200 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-teal" />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">{item.label}</span>
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      {/* 3. THE CONCEPT — flowchart Create → Send → Collect → Analyze */}
      <section className="py-8 sm:py-14 bg-gradient-to-b from-sky-50/60 to-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-5 sm:mb-8">
            <h2 className="text-base sm:text-xl font-bold text-slate-900">{cp.concept.title}</h2>
          </Reveal>
          <RevealStagger className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-2.5">
            {cp.concept.steps.map((step, idx) => {
              const Icon = STEP_ICONS[step.key] ?? ClipboardList;
              return (
                <React.Fragment key={step.key}>
                  <RevealItem>
                    <div className="bg-white border border-sky-200 rounded-2xl p-3.5 sm:p-4 text-center w-full sm:w-40 space-y-1.5">
                      <span className="w-9 h-9 mx-auto rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-brand-teal" />
                      </span>
                      <div className="text-sm font-bold text-slate-900">{step.title}</div>
                      <div className="text-[11px] text-slate-400">{step.actor}</div>
                      <div className="text-[10px] font-medium text-brand-blue bg-sky-50 rounded-md px-1.5 py-1 truncate">{step.micro}</div>
                    </div>
                  </RevealItem>
                  {idx < cp.concept.steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mx-auto rotate-90 sm:rotate-0" aria-hidden />
                  )}
                </React.Fragment>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      {/* 4. PLATFORM MODULES — bento grid, Fit Audit акцентная карточка */}
      <section className="py-8 sm:py-14 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-5 sm:mb-8 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{cp.modulesTitle}</h2>
            <p className="text-sm text-slate-500">{cp.modulesSubtitle}</p>
          </Reveal>

          <RevealStagger className="space-y-3 sm:space-y-4">
            {/* Акцентная карточка — Fit Audit, единственный доступный модуль */}
            <RevealItem>
              <Link
                to="/corporate/fit-audit"
                className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-br from-brand-blue to-brand-teal rounded-2xl p-5 sm:p-7 text-white hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
              >
                <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base sm:text-lg font-bold">{liveModule.title}</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                      {cp.statusLive}
                    </span>
                  </div>
                  <p className="text-sm text-white/85">{liveModule.description}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold shrink-0">
                  {liveModule.cta}
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </Link>
            </RevealItem>

            {/* Остальные модули — coming soon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {soonModules.map((m) => {
                const Icon = MODULE_ICONS[m.key] ?? Activity;
                return (
                  <RevealItem key={m.key}>
                    <div className="h-full flex flex-col bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 sm:p-4">
                      <div className="flex items-start justify-between gap-1.5 mb-2.5">
                        <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-slate-400" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-slate-400 border border-slate-200 shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          {cp.statusSoon}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-700 mb-0.5">{m.title}</h3>
                      <p className="text-[11px] sm:text-xs text-slate-400">{m.description}</p>
                    </div>
                  </RevealItem>
                );
              })}
            </div>
          </RevealStagger>
        </div>
      </section>

      {/* 4.5 WHAT EMPLOYEES GET — мокап личного кабинета сотрудника (Personal Scorecard) */}
      <section className="py-8 sm:py-14 bg-gradient-to-b from-sky-50/60 to-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="grid sm:grid-cols-[0.9fr_1.1fr] gap-6 sm:gap-8 items-center">
            <Reveal className="text-center sm:text-left space-y-1.5">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">{cp.employeeView.title}</h2>
              <p className="text-sm text-slate-500">{cp.employeeView.subtitle}</p>
            </Reveal>

            <Reveal className="bg-white border border-sky-200 rounded-2xl shadow-lg shadow-slate-900/5 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-sky-100 bg-slate-50/60">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 text-[11px] font-semibold text-slate-400">{cp.employeeView.chromeLabel}</span>
              </div>
              <div className="p-5 flex items-center gap-5">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="relative w-20 h-20 rounded-full border-[6px] border-sky-100 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[6px] border-brand-teal border-r-transparent border-b-transparent rotate-[35deg]" />
                    <span className="text-xl font-extrabold text-slate-900">78</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 tracking-wide mt-1">{cp.employeeView.scoreCaption}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">{cp.employeeView.companyLabel}</span>
                      <span className="font-bold text-slate-900">{cp.employeeView.companyValue}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sky-50 overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-600">{cp.employeeView.groupLabel}</span>
                      <span className="font-bold text-slate-900">{cp.employeeView.groupValue}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sky-50 overflow-hidden">
                      <div className="h-full bg-brand-teal rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. TRUST — 3 колонки с иконками */}
      <section className="py-8 sm:py-14 bg-gradient-to-b from-white to-sky-50/40">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <RevealStagger className="grid grid-cols-3 gap-2.5 sm:gap-5">
            {cp.trust.items.map((item) => {
              const Icon = TRUST_ICONS[item.key] ?? Lock;
              return (
                <RevealItem key={item.key}>
                  <div className="flex flex-col items-center text-center gap-1.5 sm:gap-2">
                    <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-sky-200 shadow-sm flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-brand-teal" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{item.label}</span>
                    <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">{item.desc}</span>
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      {/* 5.5 FAQ — компактный аккордеон, ответы 1-2 предложения */}
      <section className="py-8 sm:py-14 bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{cp.faq.title}</h2>
          </Reveal>
          <RevealStagger className="space-y-2 sm:space-y-2.5">
            {cp.faq.items.map((item) => (
              <RevealItem key={item.q}>
                <FaqItem q={item.q} a={item.a} />
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* 5.7 CONTACTS — готовый блок контактов, перед футером. Заголовок
         переопределён: дефолтный текст компонента ("Запустите Fit-Audit...
         калькулятор выше") написан для /corporate/fit-audit — здесь калькулятора
         нет, речь про платформу целиком. */}
      <ContactsSection headingOverride={cp.contactsHeading} />

      {/* 6. FINAL CTA — бесплатный пилот, самый заметный акцент страницы */}
      <section className="relative py-10 sm:py-16 overflow-hidden">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <Reveal className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue-light to-brand-teal rounded-3xl p-6 sm:p-10 text-center space-y-4 sm:space-y-5 shadow-2xl shadow-blue-500/25">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs sm:text-sm font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              {cp.pilot.title}
            </div>
            <div className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">100</div>
            <p className="text-sm sm:text-base text-white/85 max-w-md mx-auto">{cp.pilot.subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {cp.pilot.bullets.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/15 text-white text-[11px] sm:text-sm font-medium"
                >
                  {b}
                </span>
              ))}
            </div>
            <button
              onClick={openContacts}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-white hover:bg-sky-50 text-brand-blue font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              <span>{cp.pilot.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
};
