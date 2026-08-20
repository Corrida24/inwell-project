import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ContactsModalProvider } from './components/ContactsModalContext';
import { ContactsModal } from './components/ContactsModal';
import { Header } from './components/Header';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { CorporatePage } from './pages/CorporatePage';
import { FitAuditLandingPage } from './pages/FitAuditLandingPage';
import { PersonalLandingPage } from './pages/PersonalLandingPage';
import { PersonalIntakeFormPage } from './pages/PersonalIntakeFormPage';
import { PersonalReportPage } from './pages/PersonalReportPage';
import { ExampleReportPage } from './pages/ExampleReportPage';
import { CorporateLoginPage } from './pages/CorporateLoginPage';
import { CorporateDashboardPage } from './pages/CorporateDashboardPage';
import { CorporateCreateAuditPage } from './pages/CorporateCreateAuditPage';
import { CorporateAuditResultsPage } from './pages/CorporateAuditResultsPage';
import { PublicAuditPage } from './pages/PublicAuditPage';
import { CorporateAuthProvider } from './corporate/AuthContext';
import { ProtectedRoute } from './corporate/ProtectedRoute';

export default function App() {
  return (
    <LanguageProvider>
      <ContactsModalProvider>
        <CorporateAuthProvider>
          <div className="min-h-screen bg-white text-slate-800 antialiased">
            <Header />
            <main>
              <Routes>
                {/* Корень ведёт на корпоративный лендинг по умолчанию — платформа
                    Inwell позиционируется в первую очередь для бизнеса. */}
                <Route path="/" element={<Navigate to="/corporate" replace />} />
                <Route path="/corporate" element={<CorporatePage />} />
                {/* Fit Audit — первый модуль платформы, свой лендинг (бывшая
                    главная страница "для бизнеса", без изменений). */}
                <Route path="/corporate/fit-audit" element={<FitAuditLandingPage />} />
                <Route path="/personal" element={<PersonalLandingPage />} />
                <Route path="/personal/start" element={<PersonalIntakeFormPage />} />
                <Route path="/personal/report" element={<PersonalReportPage />} />
                {/* Демо-отчёт без БД — пример для страницы "для людей", см. AuditHero. */}
                <Route path="/example" element={<ExampleReportPage />} />
                {/* /audit — старый путь личного кабинета до переезда на /personal. */}
                <Route path="/audit" element={<Navigate to="/personal" replace />} />

                {/* Корпоративный кабинет */}
                <Route path="/login" element={<Navigate to="/corporate/login" replace />} />
                <Route path="/corporate/login" element={<CorporateLoginPage />} />
                <Route
                  path="/corporate/dashboard"
                  element={
                    <ProtectedRoute>
                      <CorporateDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/corporate/audits/new"
                  element={
                    <ProtectedRoute>
                      <CorporateCreateAuditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/corporate/audits/:id"
                  element={
                    <ProtectedRoute>
                      <CorporateAuditResultsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Публичная ссылка на корпоративный опросник — без логина. */}
                <Route path="/a/:token" element={<PublicAuditPage />} />
              </Routes>
            </main>
            <ScrollToTopButton />
            <ContactsModal />
          </div>
        </CorporateAuthProvider>
      </ContactsModalProvider>
    </LanguageProvider>
  );
}
