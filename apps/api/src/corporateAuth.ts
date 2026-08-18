import type { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabaseAdmin.js';
import { getCompanyByAuthUserId, type CompanyRow } from './db/companiesRepo.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      company?: CompanyRow;
    }
  }
}

/**
 * Проверяет Supabase JWT из заголовка Authorization: Bearer <token> и
 * подгружает соответствующую строку companies. Это backend-level контроль
 * доступа (не полагается на фронтенд): даже если кто-то подделает запрос
 * без валидного токена Supabase Auth или чужим токеном без строки в
 * companies — получит 401/403, а не чужие данные.
 */
export async function requireCompanyAuth(req: Request, res: Response, next: NextFunction) {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({ error: 'supabase_not_configured' });
  }
  const authHeader = req.header('authorization') || req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'missing_token' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(503).json({ error: 'supabase_not_configured' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  const company = await getCompanyByAuthUserId(data.user.id);
  if (!company) {
    // Валидный Supabase-пользователь, но для него нет строки в companies —
    // например, служебный аккаунт без корпоративного профиля.
    return res.status(403).json({ error: 'not_a_company' });
  }

  req.company = company;
  next();
}
