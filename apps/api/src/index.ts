import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { assessmentsRouter } from './routes/assessments.js';
import { corporateRouter } from './routes/corporate.js';
import { publicAuditRouter } from './routes/publicAudit.js';
import { statsRouter } from './routes/stats.js';
import { ensureSchema } from './db/migrate.js';
import { isSupabaseConfigured } from './supabaseAdmin.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
// WEB_ORIGIN может быть одним доменом ("https://inwell.uz") или списком
// через запятую ("https://inwell.uz,https://www.inwell.uz"), если позже
// понадобится разрешить ещё один origin — без изменений кода.
const rawOrigin = process.env.WEB_ORIGIN || '*';
const ALLOWED_ORIGIN = rawOrigin.includes(',')
  ? rawOrigin.split(',').map((o) => o.trim()).filter(Boolean)
  : rawOrigin;

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, supabaseConfigured: isSupabaseConfigured() }));
app.use('/api/assessments', assessmentsRouter);
// /api/corporate/* — защищённые роуты корпоративного дашборда (требуют Supabase JWT).
app.use('/api/corporate', corporateRouter);
// /api/audits/:token[...] — публичные роуты для формы сотрудника (без логина).
app.use('/api/audits', publicAuditRouter);
// /api/stats/* — публичная агрегированная статистика (счётчик на лендинге).
app.use('/api/stats', statsRouter);

/**
 * Схема применяется автоматически при старте (CREATE TABLE IF NOT EXISTS —
 * безопасно гонять при каждом запуске). Раньше это был отдельный ручной шаг
 * (`npm run migrate`), который легко забыть при первом docker compose up —
 * именно это давало 500-ки на /api/assessments ("relation users does not
 * exist"). Ретраи нужны потому, что при `docker compose up` контейнер API
 * обычно стартует раньше, чем Postgres реально готов принимать соединения.
 */
async function start() {
  const MAX_ATTEMPTS = 10;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await ensureSchema();
      console.log('[inwell-api] database schema ready');
      break;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) {
        console.error('[inwell-api] could not apply DB schema after retries — check DATABASE_URL:', err);
        process.exit(1);
      }
      console.warn(`[inwell-api] DB not ready yet (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  app.listen(PORT, () => {
    console.log(`[inwell-api] listening on :${PORT}`);
  });
}

start();
