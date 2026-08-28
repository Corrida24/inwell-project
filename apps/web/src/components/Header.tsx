import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { InwellBrand } from './InwellBrand';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactsModal } from './ContactsModalContext';
import { ArrowUpRight, Building2, LogIn, Menu, X } from 'lucide-react';

/**
 * Shared header for both site modes. "Для людей" vs "Для бизнеса" is a
 * real route change (not a scroll target), so picking one fully swaps the
 * page.
 *
 * Desktop (md+): logo | mode switch | language + login + CTA, all in one
 * row, unchanged from the original design.
 *
 * Mobile (<md): a single compact row — logo, language, hamburger — capped
 * at a fixed height so the header never grows into a second row or a tall
 * panel. Everything else (mode switch, "Войти", CTA) lives inside a
 * dropdown drawer that opens below the row on tap and closes on route
 * change / outside tap / Escape.
 *
 * "/corporate" -> business landing
 * "/personal"  -> consumer self-assessment landing (form + report live on
 *                 their own sub-routes: /personal/start, /personal/report)
 */
export const Header: React.FC = () => {
  const { t } = useLanguage();
  const { open: openContacts } = useContactsModal();
  const location = useLocation();
  const isPersonal = location.pathname.startsWith('/personal');
  // /corporate/login, /corporate/dashboard, /corporate/audits/* — уже
  // "внутри" корпоративного приложения (залогинен или логинится), там
  // нет смысла показывать "Войти"/"Связаться" маркетинговые CTA поверх.
  // /corporate/fit-audit — НЕ приложение, это публичный маркетинговый
  // лендинг модуля (бывшая главная /corporate), CTA там нужны как обычно.
  const isCorporateApp = /^\/corporate\/(login|dashboard|audits)/.test(location.pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile drawer whenever the route changes (mode switch, login, etc.)
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const modeTabClass = (active: boolean) =>
    `flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
      active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
    }`;

  // Раньше здесь был переключатель "Для бизнеса" / "Для людей" — бизнес
  // теперь единственный фокус продукта, "Для людей" убран из навигации на
  // обоих местах рендера (десктоп + мобильный drawer), см. план. /personal/*
  // маршруты НЕ удалены — по прямой ссылке всё ещё открываются (App.tsx не
  // менялся), просто на них больше никто не ведёт из хедера.
  const ModeSwitch = ({ full = false }: { full?: boolean }) => (
    <div className={`inline-flex items-center gap-0.5 bg-slate-100/80 rounded-full p-1 ${full ? 'w-full' : ''}`}>
      <NavLink to="/corporate" className={() => modeTabClass(!isPersonal) + (full ? ' flex-1' : '')}>
        <Building2 className="w-3.5 h-3.5" />
        <span>{t.modeSwitch.businessShort}</span>
      </NavLink>
    </div>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/85 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Closed state — fixed-height single row on every breakpoint. */}
        <div className="h-14 md:h-auto md:py-3.5 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between gap-3">
          <NavLink to="/corporate" className="flex items-center gap-2.5 group justify-self-start" onClick={() => setMenuOpen(false)}>
            <img
              src="/logo-single.png"
              alt="Inwell"
              className="h-7 md:h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <InwellBrand className="hidden xs:inline text-slate-900" />
          </NavLink>

          <div className="hidden md:block justify-self-center">
            <ModeSwitch />
          </div>

          <div className="hidden md:flex items-center gap-3 justify-self-end">
            <LanguageSwitcher />
            {!isPersonal && !isCorporateApp && (
              <NavLink
                to="/corporate/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.loginCta}</span>
              </NavLink>
            )}
            {!isPersonal && !isCorporateApp && (
              <button
                onClick={openContacts}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-light transition-all shadow-sm active:scale-95"
              >
                <span>{t.nav.contactCta}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile-only: language + hamburger, nothing else on this row. */}
          <div className="flex md:hidden items-center gap-1">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t.common.menu}
              aria-expanded={menuOpen}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-transform"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer — everything the closed row hides. Route-switching
          buttons close it via the pathname effect above. */}
      {menuOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white shadow-lg">
          <div className="px-4 sm:px-6 py-3 space-y-2.5">
            <ModeSwitch full />
            {!isPersonal && !isCorporateApp && (
              <NavLink
                to="/corporate/login"
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.loginCta}</span>
              </NavLink>
            )}
            {!isPersonal && !isCorporateApp && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openContacts();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-blue active:scale-95 transition-transform"
              >
                <span>{t.nav.contactCta}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
