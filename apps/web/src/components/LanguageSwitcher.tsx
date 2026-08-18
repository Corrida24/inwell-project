import React from 'react';
import { useLanguage, type Lang } from '../i18n/LanguageContext';

const OPTIONS: { code: Lang; label: string }[] = [
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
];

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`inline-flex items-center gap-0.5 text-xs font-semibold ${className}`}>
      {OPTIONS.map((opt, i) => (
        <React.Fragment key={opt.code}>
          {i > 0 && <span className="text-slate-300">/</span>}
          <button
            onClick={() => setLang(opt.code)}
            aria-current={lang === opt.code}
            className={`px-1.5 py-1 rounded-md transition-colors ${
              lang === opt.code ? 'text-brand-blue' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {opt.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
