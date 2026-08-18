import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

/** Floating button, bottom-right, appears once the user has scrolled a bit. */
export const ScrollToTopButton: React.FC = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t.common.scrollToTop}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-white border border-sky-200 shadow-lg text-brand-blue hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all flex items-center justify-center active:scale-95"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
