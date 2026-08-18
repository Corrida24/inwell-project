import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

/**
 * Supabase (и вообще любой внешний managed Postgres) требует TLS на
 * подключениях снаружи — без этого драйвер либо получит отказ на
 * рукопожатии, либо (в зависимости от настроек проекта) не сможет
 * авторизоваться. rejectUnauthorized: false — потому что минимальные
 * образы контейнеров (например, node:22-alpine, см. Dockerfile) не всегда
 * содержат полный набор корневых сертификатов для цепочки пулера; это тот
 * же подход, что в официальных примерах подключения Supabase к node-postgres.
 * Локальный/тестовый Postgres на localhost остаётся без TLS — не ломает
 * локальную разработку и ручное тестирование против локальной базы.
 */
const isLocalHost = connectionString ? /@(localhost|127\.0\.0\.1)(:|\/)/i.test(connectionString) : true;

export const pool = new Pool({
  connectionString,
  ssl: isLocalHost ? undefined : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  // Idle client errors shouldn't crash the whole process.
  console.error('[db] unexpected error on idle client', err);
});
