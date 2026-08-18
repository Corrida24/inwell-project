import React from 'react';
import { Phone, Send, Instagram, ArrowUpRight, ArrowRight } from 'lucide-react';
import { INWELL_CONTACTS } from '../data/wellfitData';
import { useLanguage } from '../i18n/LanguageContext';
import { useContactsModal } from './ContactsModalContext';
import { SectionGlow } from './ui/SectionGlow';
import { Reveal, RevealStagger, RevealItem } from './ui/Reveal';

const CHANNEL_ICONS = [Phone, Send, Send, Instagram];

export const ContactsSection: React.FC = () => {
  const { t } = useLanguage();
  const { open: openContacts } = useContactsModal();
  const c = t.contactsSection;

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
    <section id="contacts" className="relative py-10 sm:py-20 bg-gradient-to-b from-sky-50 to-white overflow-hidden">
      <SectionGlow variant="blue" />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2 sm:space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {c.headingPre}{' '}
            <span className="bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-teal bg-clip-text text-transparent">
              {c.headingHighlight}
            </span>{' '}
            {c.headingPost}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{c.subtitle}</p>
          <button
            onClick={openContacts}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <span>{c.ctaPrimary}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Reveal>

        <RevealStagger className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <RevealItem key={ch.title}>
                <a
                  href={ch.href}
                  target={ch.href.startsWith('http') ? '_blank' : undefined}
                  rel={ch.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="group h-full flex flex-col bg-white border border-sky-200 rounded-2xl p-3.5 sm:p-6 hover:-translate-y-1 hover:shadow-lg hover:border-brand-teal/40 transition-all duration-300"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center mb-2.5 sm:mb-4 group-hover:bg-brand-teal group-hover:border-brand-teal transition-all duration-300">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-teal group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{ch.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-2.5 sm:mb-4 flex-1">{ch.value}</p>
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-brand-blue group-hover:text-brand-teal transition-colors">
                    {ch.cta}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </a>
              </RevealItem>
            );
          })}
        </RevealStagger>
      </div>
    </section>
  );
};
