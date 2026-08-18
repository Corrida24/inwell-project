import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** null когда переменные окружения ещё не заданы — тогда корпоративный
 * логин явно недоступен (см. CorporateLoginPage), а не падает с непонятной
 * ошибкой. anon/publishable ключ безопасен во фронтенд-бандле (см.
 * .env.example) — доступ реально ограничивается Auth + RLS на стороне
 * Supabase. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;

export const isSupabaseConfigured = Boolean(url && key);
