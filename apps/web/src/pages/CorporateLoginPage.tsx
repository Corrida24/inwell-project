import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Phone, Send } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCorporateAuth } from '../corporate/AuthContext';
import { INWELL_CONTACTS } from '../data/wellfitData';

/**
 * Реальный корпоративный логин (Supabase Auth, email+пароль). Минимализм по
 * ТЗ: без hero, без анимаций, без маркетингового текста — просто форма.
 */
export const CorporateLoginPage: React.FC = () => {
  const { t } = useLanguage();
  const l = t.login;
  const c = t.corporate;
  const { session, configured, signIn } = useCorporateAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session) return <Navigate to="/corporate/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError(c.errors.invalidCredentials);
      return;
    }
    navigate('/corporate/dashboard');
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-5 pt-20 pb-10 bg-white">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-bold text-slate-900 mb-1">{l.title}</h1>
        <p className="text-sm text-slate-500 mb-6">{l.subtitle}</p>

        {!configured ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">Supabase ещё не настроен (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                {l.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={l.emailPlaceholder}
                autoComplete="username"
                className="w-full px-3 py-2 rounded-lg border border-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                {l.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={l.passwordPlaceholder}
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg border border-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>

            {error && <p className="text-xs text-rose-500 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue-light text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {submitting ? l.submitting : l.submit}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-sky-100 space-y-2">
          <p className="text-xs text-slate-500">{l.accessNote}</p>
          <a href={`tel:${INWELL_CONTACTS.phoneRaw}`} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-brand-blue transition-colors">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{INWELL_CONTACTS.phoneDisplay}</span>
          </a>
          <a href={INWELL_CONTACTS.telegramFounder} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-brand-blue transition-colors">
            <Send className="w-3.5 h-3.5 text-slate-400" />
            <span>Telegram: @xurshidkodirov</span>
          </a>
        </div>

        <Link to="/corporate" className="block text-center text-xs font-semibold text-brand-blue hover:text-brand-teal mt-5 transition-colors">
          {l.backLink}
        </Link>
      </div>
    </section>
  );
};
