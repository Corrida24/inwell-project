import React from 'react';
import { Hero } from '../components/Hero';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { ParametersSection } from '../components/ParametersSection';
import { ProcessSection } from '../components/ProcessSection';
import { ConfidentialitySection } from '../components/ConfidentialitySection';
import { ReportExampleSection } from '../components/ReportExampleSection';
import { CertificatesSection } from '../components/CertificatesSection';
import { PricingSection } from '../components/PricingSection';
import { FaqSection } from '../components/FaqSection';
import { ContactsSection } from '../components/ContactsSection';
import { Footer } from '../components/Footer';

/** The original B2B landing — reached via the "Для бизнеса" header tab at "/".
 * Repositioned around the free online corporate Fit-Audit (link → employees
 * self-fill → anonymized corporate dashboard) instead of the paid offline
 * on-site visit, which is now just one of several paid add-ons. */
export const BusinessPage: React.FC = () => {
  return (
    <>
      {/* 1. Хук + ценностное предложение: бесплатный Fit-Audit */}
      <Hero />
      {/* 2. Почему это важно бизнесу */}
      <ProblemSection />
      {/* 3. Что такое корпоративный Fit-Audit + что получает компания */}
      <SolutionSection />
      {/* 4. Глубина замера — 13 измерений → 15 показателей + аналитика по структуре команды */}
      <ParametersSection />
      {/* 5. Как это работает — 6 онлайн-шагов */}
      <ProcessSection />
      {/* 6. Конфиденциальность + что получает сотрудник */}
      <ConfidentialitySection />
      {/* 7. Демо корпоративного dashboard */}
      <ReportExampleSection />
      {/* 8. Сертификаты — платная опция */}
      <CertificatesSection />
      {/* 9. Тарифы и калькулятор (базовый аудит + доп. услуги) */}
      <PricingSection />
      {/* 10. Снятие возражений */}
      <FaqSection />
      {/* 12. Финальный CTA */}
      <ContactsSection />
      <Footer showNav />
    </>
  );
};
