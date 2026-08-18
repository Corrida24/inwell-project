import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Единственная база проекта — Supabase Postgres (DATABASE_URL из
 * apps/api/.env указывает на неё напрямую, никакого локального Docker
 * Postgres как альтернативы/fallback больше нет). Миграции лежат в
 * db/migrations/*.sql и применяются по имени файла в порядке сортировки
 * (0001_..., 0002_..., и т.д.) — каждый файл написан идемпотентно (CREATE
 * TABLE IF NOT EXISTS / CREATE POLICY после DROP POLICY IF EXISTS), поэтому
 * безопасно гонять при каждом старте, без отдельной таблицы учёта версий —
 * это соответствует уже существовавшему в проекте подходу (raw SQL,
 * применяемый на старте), просто теперь разложенному по версионируемым
 * файлам вместо одного schema.sql.
 */
export async function ensureSchema(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    try {
      await pool.query(sql);
      console.log(`[migrate] applied ${file}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // 0002 ссылается на auth.users/auth.uid() (управляется Supabase Auth).
      // Это НЕ переключение на другую базу — та же самая (единственная)
      // Supabase Postgres база, просто защита шага миграции на случай, если
      // он выполнится раньше, чем Supabase успеет полностью подготовить
      // проект (auth-схема появляется одной из первых, но на всякий случай).
      if (/schema "auth" does not exist/i.test(message) || /relation "auth\.users" does not exist/i.test(message)) {
        console.warn(`[migrate] skipped ${file} — Supabase auth schema not found yet on this database (${message}).`);
        continue;
      }
      throw err;
    }
  }
}

// Позволяет и запускать отдельной командой (`npm run migrate`), и
// импортировать ensureSchema() из index.ts для автоприменения при старте.
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  ensureSchema()
    .then(() => {
      console.log('[migrate] all migrations applied.');
      return pool.end();
    })
    .catch((err) => {
      console.error('[migrate] failed:', err);
      process.exit(1);
    });
}
