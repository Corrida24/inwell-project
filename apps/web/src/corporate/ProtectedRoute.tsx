import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCorporateAuth } from './AuthContext';

/** Неавторизованный пользователь не получает доступа к дашборду — редирект
 * на /corporate/login. Проверка на сервере тоже есть (requireCompanyAuth в
 * apps/api), этот компонент — просто UX-слой, а не единственная защита. */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useCorporateAuth();

  if (session === undefined) return null; // проверяем сессию
  if (session === null) return <Navigate to="/corporate/login" replace />;

  return <>{children}</>;
};
