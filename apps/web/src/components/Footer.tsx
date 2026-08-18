import React from 'react';
import { Link } from 'react-router-dom';
import { INWELL_CONTACTS } from '../data/wellfitData';
import { InwellBrand } from './InwellBrand';
import { useLanguage } from '../i18n/LanguageContext';
import { Phone, Mail, Send, Instagram, ShieldCheck } from 'lucide-react';

const PRESENTATION_URL = '/Inwell-Presentation.pdf';

interface FooterProps {
  /** Show the "Навигация" column with anchor links to business-landing sections.
   * Those anchors only exist on the business page, so keep this off elsewhere. */
  showNav?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showNav = false }) => {
  const { t } = useLanguage();
  const f = t.footer;

  return (
    <footer className="bg-white border-t border-sky-200 pt-7 pb-6 sm:pt-10 sm:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className={`grid grid-cols-1 gap-6 pb-6 sm:gap-8 sm:pb-8 border-b border-sky-100 ${showNav ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          <div className="space-y-3">
            <Link to="/corporate" className="flex items-center gap-2">
              <img src="/logo-single.png" alt="Inwell" className="h-8 w-auto" />
              <InwellBrand className="text-slate-900" />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{f.description}</p>
            <div className="flex items-center gap-1.5 text-xs text-brand-teal">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{f.lawNote}</span>
            </div>
          </div>

          {showNav && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">{f.navTitle}</span>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {f.navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-brand-teal transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">{f.contactsTitle}</span>
            <div className="space-y-2 text-sm text-slate-600">
              <a href={`tel:${INWELL_CONTACTS.phoneRaw}`} className="flex items-center gap-2 hover:text-brand-teal transition-colors">
                <Phone className="w-4 h-4 text-brand-teal" />
                {INWELL_CONTACTS.phoneDisplay}
              </a>
              <a href={`mailto:${INWELL_CONTACTS.email}`} className="flex items-center gap-2 hover:text-brand-teal transition-colors">
                <Mail className="w-4 h-4 text-brand-teal" />
                {INWELL_CONTACTS.email}
              </a>
              <a href={INWELL_CONTACTS.telegramCompany} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-teal transition-colors">
                <Send className="w-4 h-4 text-brand-teal" />
                {f.telegramCompanyLabel}
              </a>
              <a href={INWELL_CONTACTS.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-teal transition-colors">
                <Instagram className="w-4 h-4 text-brand-teal" />
                {INWELL_CONTACTS.instagramHandle}
              </a>
              <a href={PRESENTATION_URL} download className="flex items-center gap-2 hover:text-brand-teal transition-colors text-brand-blue font-medium">
                {f.downloadPdfLabel}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>{f.copyright}</p>
          <p>{f.medicalDisclaimer}</p>
        </div>
      </div>
    </footer>
  );
};
