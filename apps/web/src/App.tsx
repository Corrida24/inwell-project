import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ContactsModalProvider } from './components/ContactsModalContext';
import { ContactsModal } from './components/ContactsModal';
import { Header } from './components/Header';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CorporateAuthProvider } from './corporate/AuthContext';
import { ProtectedRoute } from './corporate/ProtectedRoute';

// Route-level code splitting: each page is its own chunk instead of all of
// them (personal flow, corporate marketing, corporate app, public audit
// forms/reports) shipping in one 932 KB bundle to every visitor -- see the
// code review, section 6. Header/ScrollToTopButton/ContactsModal stay
// eagerly loaded since they render on every route regardless.
const CorporatePage = lazy(() => import('./pages/CorporatePage').then((m) => ({ default: m.CorporatePage })));
const FitAuditLandingPage = lazy(() => import('./pages/FitAuditLandingPage').then((m) => ({ default: m.FitAuditLandingPage })));
const PersonalLandingPage = lazy(() => import('./pages/PersonalLandingPage').then((m) => ({ default: m.PersonalLandingPage })));
const PersonalIntakeFormPage = lazy(() => import('./pages/PersonalIntakeFormPage').then((m) => ({ default: m.PersonalIntakeFormPage })));
const PersonalReportPage = lazy(() => import('./pages/PersonalReportPage').then((m) => ({ default: m.PersonalReportPage })));
const ExampleReportPage = lazy(() => import('./pages/ExampleReportPage').then((m) => ({ default: m.ExampleReportPage })));
const CorporateLoginPage = lazy(() => import('./pages/CorporateLoginPage').then((m) => ({ default: m.CorporateLoginPage })));
const CorporateDashboardPage = lazy(() => import('./pages/CorporateDashboardPage').then((m) => ({ default: m.CorporateDashboardPage })));
const CorporateCreateAuditPage = lazy(() => import('./pages/CorporateCreateAuditPage').then((m) => ({ default: m.CorporateCreateAuditPage })));
const CorporateAuditResultsPage = lazy(() => import('./pages/CorporateAuditResultsPage').then((m) => ({ default: m.CorporateAuditResultsPage })));
const PublicAuditPage = lazy(() => import('./pages/PublicAuditPage').then((m) => ({ default: m.PublicAuditPage })));

/** Minimal, deliberately unstyled-but-not-jarring loading state for the
 * Suspense boundary below -- shown only for the moment it takes to fetch a
 * route's chunk (typically well under a second on a real connection). */
const RouteLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-blue animate-spin" />
  </div>
);

export default function App() {
  return (
    <LanguageProvider>
      <ContactsModalProvider>
        <CorporateAuthProvider>
          <div className="min-h-screen bg-white text-slate-800 antialiased">
            <Header />
            <main>
              <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback />}>
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
              </Suspense>
              </ErrorBoundary>
            </main>
            <ScrollToTopButton />
            <ContactsModal />
          </div>
        </CorporateAuthProvider>
      </ContactsModalProvider>
    </LanguageProvider>
  );
}
