import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Единственное место, где на бэкенде создаётся Supabase-клиент с
 * service_role ключом. Используется для:
 *  1) проверки JWT компании на защищённых /api/corporate/* роутах
 *     (supabaseAdmin.auth.getUser(token));
 *  2) админ-скрипта db/createCompany.ts (создание пользователя Auth).
 * Ключ НИКОГДА не должен попасть во фронтенд — этот файл импортируется
 * только из apps/api.
 *
 * Намеренно НЕ падаем на process.exit при отсутствии переменных — API
 * должен продолжать обслуживать personal-часть, даже если Supabase ещё не
 * настроен. Корпоративные роуты в этом случае явно отвечают 503 (см.
 * corporateAuth.ts), а не роняют весь сервер.
 */
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}
