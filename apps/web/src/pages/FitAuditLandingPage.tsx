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

/** Fit Audit — первый работающий модуль платформы Inwell, свой отдельный
 * лендинг на /corporate/fit-audit. Раньше это была ГЛАВНАЯ страница "для
 * бизнеса" (/corporate) — сейчас место главной заняла CorporatePage.tsx
 * (продаёт платформу целиком), а этот лендинг остался БЕЗ ИЗМЕНЕНИЙ по
 * дизайну/структуре/копирайтингу, просто переехал под ссылку — доступен по
 * клику на карточку "Physical Fitness Audit" на /corporate или через кнопку
 * "Смотреть Fit Audit" в hero. */
export const FitAuditLandingPage: React.FC = () => {
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
