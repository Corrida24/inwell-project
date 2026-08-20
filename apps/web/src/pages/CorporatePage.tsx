import React from 'react';
import {
  ArrowRight,
  Activity,
  Brain,
  Heart,
  Apple,
  Moon,
  Flame,
  Zap,
  TrendingUp,
  Wallet,
  Link2,
  ClipboardEdit,
  Share2,
  BarChart3,
  Users,
  Lock,
  Rocket,
  CheckCircle2,
  Phone,
  Send,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactsModal } from '../components/ContactsModalContext';
import { INWELL_CONTACTS } from '../data/wellfitData';
import { SectionGlow } from '../components/ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from '../components/ui/Reveal';
import { FaqItem } from '../components/ui/FaqAccordion';
import { Footer } from '../components/Footer';

const CURIOSITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  burnout: Flame,
  stress: Zap,
  dynamics: TrendingUp,
  budget: Wallet,
};

const CONCEPT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  connect: Link2,
  create: ClipboardEdit,
  share: Share2,
  analyze: BarChart3,
};

const TIME_TO_VALUE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  launch: Rocket,
  calc: BarChart3,
  anon: Lock,
};

/** 5 модулей платформы — все РАВНОЗНАЧНЫ (без "доступно"/"скоро"), каждому
 * своя иконка и лёгкий цветовой акцент, чтобы bento-грид не читалась как
 * "один активный + 4 мёртвых", а как 5 полноценных направлений одной
 * платформы. */
const MODULE_STYLES: Record<string, { icon: React.ComponentType<{ className?: string }>; iconBg: string; iconBorder: string; iconColor: string }> = {
  fitness: { icon: Activity, iconBg: 'bg-teal-50', iconBorder: 'border-teal-200', iconColor: 'text-brand-teal' },
  mental: { icon: Brain, iconBg: 'bg-indigo-50', iconBorder: 'border-indigo-200', iconColor: 'text-indigo-600' },
  satisfaction: { icon: Heart, iconBg: 'bg-rose-50', iconBorder: 'border-rose-200', iconColor: 'text-rose-500' },
  nutrition: { icon: Apple, iconBg: 'bg-amber-50', iconBorder: 'border-amber-200', iconColor: 'text-amber-600' },
  sleep: { icon: Moon, iconBg: 'bg-sky-50', iconBorder: 'border-sky-200', iconColor: 'text-brand-blue' },
};

/** Короткие подписи модулей для узкого мокапа "Мой отчёт" (сотрудник) —
 * чтобы не обрезалось на мобильном; полные названия остаются в bento-гриде. */
const MODULE_SHORT_TITLE: Record<string, string> = {
  fitness: 'Physical Fitness',
  mental: 'Mental Wellbeing',
  satisfaction: 'Job Satisfaction',
  nutrition: 'Nutrition & Habits',
  sleep: 'Sleep & Recovery',
};

/** Точный кольцевой индикатор через conic-gradient — переиспользуется в
 * hero-дашборде и мокапах "сотрудник/HR". */
const ScoreRing: React.FC<{ score: number; size?: number; label?: string }> = ({ score, size = 80, label }) => (
  <div className="shrink-0 flex flex-col items-center gap-1.5">
    <div
      className="relative rounded-full flex items-center justify-center"
      style={{ width: size, height: size, background: `conic-gradient(#14b8a6 ${score * 3.6}deg, #e0f2fe 0deg)` }}
    >
      <div className="absolute rounded-full bg-white flex items-center justify-center" style={{ inset: Math.max(5, size * 0.08) }}>
        <span className="font-extrabold text-slate-900" style={{ fontSize: size * 0.28 }}>
          {score}
        </span>
      </div>
    </div>
    {label && <span className="text-[10px] font-semibold text-slate-500 tracking-wide text-center max-w-[8rem]">{label}</span>}
  </div>
);

/** Тонкая полоса-метрика с подписью и процентом. */
const MetricBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div>
    <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1">
      <span className="font-semibold text-slate-600">{label}</span>
      <span className="font-bold text-slate-900">{value}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-sky-50 overflow-hidden">
      <div className="h-full bg-brand-teal rounded-full" style={{ width: `${value}%` }} />
    </div>
  </div>
);

/** Шапка карточки-мокапа в стиле окна браузера — единый визуальный приём
 * для всех "это реальный продукт с данными" блоков. */
const ChromeBar: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-sky-100 bg-slate-50/60">
    <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
    <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
    <span className="ml-2 text-[11px] font-semibold text-slate-400">{label}</span>
  </div>
);

/**
 * /corporate — B2B SaaS Corporate Wellness Platform лендинг Inwell.
 * Позиционирование: онлайн-платформа, которая по данным нескольких тестов
 * считает комплексный индекс здоровья компании во времени — 5 равнозначных
 * направлений (Physical Fitness, Mental Wellbeing, Job Satisfaction & eNPS,
 * Nutrition & Habits, Sleep & Recovery), а не "один рабочий модуль + роадмап".
 * Единая цель конверсии — заявка (кнопка "Оставить заявку" открывает
 * контакты), без параллельных формулировок CTA. Все цифры в дашборд-мокапах
 * — иллюстративные демо-данные, явно подписаны.
 */
export const CorporatePage: React.FC = () => {
  const { t } = useLanguage();
  const { open: openContacts } = useContactsModal();
  const cp = t.corporatePlatform;
  const h = cp.hero;
  const ev = cp.employeeVsHr;

  return (
    <>
      {/* 1. HERO — заголовок + вопрос-крючок + короткое объяснение + крупный
         дашборд-мокап с 4 метриками и бейджем участников */}
      <section className="relative pt-20 pb-10 sm:pt-28 sm:pb-16 overflow-hidden bg-gradient-to-b from-sky-50 via-white to-teal-50/30">
        <SectionGlow variant="blue" />
        <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-10 items-center">
            <div className="text-center lg:text-left space-y-3.5 sm:space-y-4">
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

              <p className="text-base sm:text-xl font-semibold text-slate-800 max-w-md mx-auto lg:mx-0">{h.question}</p>

              <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto lg:mx-0 leading-relaxed">{h.subtitle}</p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
                <button
                  onClick={openContacts}
                  className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>{h.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-white hover:bg-sky-50 text-slate-800 font-semibold text-sm border border-sky-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>{h.ctaSecondary}</span>
                </a>
              </div>
            </div>

            {/* Дашборд-мокап — крупный, с 4 метриками сразу по всем
               направлениям платформы, видим и на мобильных */}
            <div>
              <div className="bg-white border border-sky-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden">
                <ChromeBar label={h.dashboardLabel} />
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <ScoreRing score={h.dashboard.score} size={88} label={h.dashboard.scoreLabel} />
                    <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
                      {h.dashboard.metrics.map((m) => (
                        <MetricBar key={m.key} label={m.label} value={m.value} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-sky-50 border border-sky-100 rounded-xl p-3">
                    <span className="w-8 h-8 rounded-lg bg-white border border-sky-200 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-brand-blue" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">{h.dashboard.participantsBadge}</span>
                  </div>
                  <div className="text-center text-[10px] font-medium text-slate-400">{h.dashboardDemoNote}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ЛЮБОПЫТСТВО — "чего компания может не знать о своей команде" */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-6 sm:mb-9 space-y-2">
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">{cp.curiosity.title}</h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">{cp.curiosity.subtitle}</p>
          </Reveal>
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {cp.curiosity.items.map((item) => {
              const Icon = CURIOSITY_ICONS[item.key] ?? Zap;
              return (
                <RevealItem key={item.key}>
                  <div className="h-full flex items-start gap-3 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-5">
                    <span className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-brand-teal" />
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">{item.question}</p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      {/* 3. КАК ЭТО РАБОТАЕТ — Connect → Create → Share → Analyze */}
      <section id="how-it-works" className="py-10 sm:py-16 bg-gradient-to-b from-sky-50/60 to-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-6 sm:mb-9">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900">{cp.concept.title}</h2>
          </Reveal>
          <RevealStagger className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-2.5">
            {cp.concept.steps.map((step, idx) => {
              const Icon = CONCEPT_ICONS[step.key] ?? Link2;
              return (
                <React.Fragment key={step.key}>
                  <RevealItem>
                    <div className="bg-white border border-sky-200 rounded-2xl p-4 text-center w-full sm:w-44 space-y-1.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-bold text-brand-blue/60">{step.number}</span>
                        <span className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-brand-teal" />
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{step.title}</div>
                      <div className="text-[11px] text-slate-500">{step.actor}</div>
                      <div className="text-[11px] font-medium text-brand-blue bg-sky-50 rounded-md px-1.5 py-1 truncate">{step.micro}</div>
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

      {/* 4. 5 МОДУЛЕЙ ПЛАТФОРМЫ — равнозначный bento-грид, без статусов */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-6 sm:mb-9 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{cp.modulesTitle}</h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">{cp.modulesSubtitle}</p>
          </Reveal>

          <RevealStagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {cp.modules.map((m) => {
              const style = MODULE_STYLES[m.key] ?? MODULE_STYLES.fitness;
              const Icon = style.icon;
              return (
                <RevealItem key={m.key}>
                  <div className="h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <span className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${style.iconBg} ${style.iconBorder}`}>
                      <Icon className={`w-4.5 h-4.5 ${style.iconColor}`} />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{m.title}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug mb-3 flex-1">{m.description}</p>
                    <span className="inline-flex self-start items-center text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                      {m.badge}
                    </span>
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      {/* 5. СОТРУДНИК vs HR — два равных UI-блока с bullet-поинтами и privacy-бейджами */}
      <section className="py-10 sm:py-16 bg-sky-50/50">
        <div className="max-w-5xl mx-auto px-5 sm:px-6">
          <RevealStagger className="grid md:grid-cols-2 gap-5 sm:gap-6">
            {/* Колонка сотрудника */}
            <RevealItem>
              <div className="h-full flex flex-col bg-white border border-sky-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{ev.employee.title}</h3>

                <div className="bg-slate-50/70 border border-sky-100 rounded-xl overflow-hidden">
                  <ChromeBar label={ev.employee.chromeLabel} />
                  <div className="p-4 flex items-center gap-4">
                    <ScoreRing score={ev.employee.score} size={64} label={ev.employee.scoreCaption} />
                    <div className="flex-1 min-w-0 space-y-2">
                      {cp.modules.slice(0, 3).map((m) => (
                        <div key={m.key} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                          <span className="text-[11px] text-slate-600 truncate">{MODULE_SHORT_TITLE[m.key] ?? m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2">
                  {ev.employee.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-2 bg-teal-50/60 border border-teal-100 rounded-xl p-3 mt-auto">
                  <Lock className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-medium text-slate-700">{ev.employee.privacyBadge}</p>
                </div>
              </div>
            </RevealItem>

            {/* Колонка HR / компании */}
            <RevealItem>
              <div className="h-full flex flex-col bg-white border border-sky-200 rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{ev.hr.title}</h3>

                <div className="bg-slate-50/70 border border-sky-100 rounded-xl overflow-hidden">
                  <ChromeBar label={ev.hr.chromeLabel} />
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <ScoreRing score={ev.hr.score} size={56} />
                      <span className="text-xs font-semibold text-slate-600">{ev.hr.scoreLabel}</span>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 mb-1.5">{ev.hr.departmentsLabel}</div>
                      <div className="space-y-1.5">
                        {ev.hr.departments.map((d) => (
                          <div key={d.key} className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 w-20 shrink-0 truncate">{d.label}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-sky-100 overflow-hidden">
                              <div className="h-full bg-brand-blue rounded-full" style={{ width: `${d.value}%` }} />
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 w-8 text-right shrink-0">{d.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <ul className="space-y-2">
                  {ev.hr.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-start gap-2 bg-sky-50/60 border border-sky-100 rounded-xl p-3 mt-auto">
                  <BarChart3 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm font-medium text-slate-700">{ev.hr.privacyBadge}</p>
                </div>
              </div>
            </RevealItem>
          </RevealStagger>
        </div>
      </section>

      {/* 6. TIME-TO-VALUE — 3 карточки с мягким градиентом вместо сухого текста */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <RevealStagger className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {cp.timeToValue.items.map((item) => {
              const Icon = TIME_TO_VALUE_ICONS[item.key] ?? Zap;
              return (
                <RevealItem key={item.key}>
                  <div className="h-full flex flex-col items-center text-center gap-2 bg-gradient-to-b from-sky-50 to-white border border-sky-100 rounded-2xl p-5 sm:p-6">
                    <span className="w-11 h-11 rounded-xl bg-white border border-sky-200 shadow-sm flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-teal" />
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900">{item.title}</span>
                    <span className="text-xs sm:text-sm text-slate-500 leading-snug">{item.desc}</span>
                  </div>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </div>
      </section>

      {/* 7. FAQ — компактный аккордеон */}
      <section className="py-10 sm:py-16 bg-slate-50/60">
        <div className="max-w-2xl mx-auto px-5 sm:px-6">
          <Reveal className="text-center mb-6 sm:mb-8">
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

      {/* 8. ЕДИНАЯ ФИНАЛЬНАЯ CTA-СЕКЦИЯ — заявка + только телефон и Telegram */}
      <section className="relative py-10 sm:py-16 overflow-hidden bg-gradient-to-b from-white to-sky-50/40">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <Reveal className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue-light to-brand-teal rounded-3xl p-6 sm:p-10 text-center space-y-4 sm:space-y-5 shadow-2xl shadow-blue-500/25">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">{cp.finalCta.title}</h2>
            <p className="text-sm sm:text-base text-white/85 max-w-md mx-auto leading-relaxed">{cp.finalCta.subtitle}</p>
            <button
              onClick={openContacts}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-white hover:bg-sky-50 text-brand-blue font-bold text-sm transition-all shadow-lg active:scale-95"
            >
              <span>{cp.finalCta.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 sm:pt-4 mt-2 border-t border-white/20">
              <div className="text-[11px] font-semibold text-white/60 uppercase tracking-wide mb-2.5">{cp.finalCta.contactsLabel}</div>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/90">
                <a href={`tel:${INWELL_CONTACTS.phoneRaw}`} className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                  {INWELL_CONTACTS.phoneDisplay}
                </a>
                <a
                  href={INWELL_CONTACTS.telegramCompany}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Telegram
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
};
