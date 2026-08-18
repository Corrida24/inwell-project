import React, { useEffect } from 'react';
import { Phone, Send, Instagram, ArrowUpRight, X } from 'lucide-react';
import { INWELL_CONTACTS } from '../data/wellfitData';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactsModal } from './ContactsModalContext';

const CHANNEL_ICONS = [Phone, Send, Send, Instagram];

export const ContactsModal: React.FC = () => {
  const { isOpen, close } = useContactsModal();
  const { t } = useLanguage();
  const c = t.contactsSection;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const channels = c.channels.map((ch, idx) => {
    let href = '#';
    let value = ch.value;
    let title = ch.title;

    if (idx === 0) {
      href = `tel:${INWELL_CONTACTS.phoneRaw}`;
      value = INWELL_CONTACTS.phoneDisplay;
    } else if (idx === 1) {
      href = INWELL_CONTACTS.telegramCompany;
    } else if (idx === 2) {
      href = INWELL_CONTACTS.telegramFounder;
      title = c.telegramFounderLabel;
    } else if (idx === 3) {
      href = INWELL_CONTACTS.instagram;
      value = INWELL_CONTACTS.instagramHandle;
    }

    return { ...ch, title, value, href, icon: CHANNEL_ICONS[idx] };
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={close} aria-hidden />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7 animate-[fadeIn_0.15s_ease-out]">
        <button
          onClick={close}
          aria-label={t.common.close}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-1.5 pr-8">
          {c.headingPre} {c.headingHighlight} {c.headingPost}
        </h3>
        <p className="text-sm text-slate-500 mb-6">{c.subtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <a
                key={ch.title}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel={ch.href.startsWith('http') ? 'noreferrer' : undefined}
                className="group flex flex-col bg-sky-50/60 border border-sky-200 rounded-xl p-4 hover:border-brand-teal/50 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-sky-200 flex items-center justify-center mb-3 group-hover:bg-brand-teal group-hover:border-brand-teal transition-all">
                  <Icon className="w-4 h-4 text-brand-teal group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-0.5">{ch.title}</h4>
                <p className="text-xs text-slate-500 mb-2 flex-1">{ch.value}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue group-hover:text-brand-teal transition-colors">
                  {ch.cta}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
