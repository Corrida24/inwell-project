import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { AuditHero } from '../audit/AuditHero';
import { AuditWhySection } from '../audit/AuditWhySection';
import { AuditHowSection } from '../audit/AuditHowSection';
import { AuditFaqSection } from '../audit/AuditFaqSection';
import { ContactsSection } from '../components/ContactsSection';
import { Footer } from '../components/Footer';

/** Personal / consumer landing — reached via the "Для людей" header tab at
 * /personal. Hero → why → how it works → FAQ → contacts, тот же
 * визуальный код (bento-карточки, UI-мокапы, Reveal-анимации), что и на
 * /corporate — единый дизайн-язык B2B/B2C. Форма ввода и отчёт живут на
 * своих маршрутах (/personal/start, /personal/report). */
export const PersonalLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <>
      <AuditHero onStart={() => navigate('/personal/start')} />
      <AuditWhySection />
      <AuditHowSection />
      <AuditFaqSection />
      <ContactsSection headingOverride={t.audit.contactsHeading} />
      <Footer />
    </>
  );
};
