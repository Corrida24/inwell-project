import 'dotenv/config';
import { getSupabaseAdmin } from '../supabaseAdmin.js';
import { createCompany } from './companiesRepo.js';
import { pool } from './pool.js';

/**
 * Админ-скрипт создания корпоративного аккаунта. Публичной регистрации нет
 * по ТЗ — компании заводит владелец проекта вручную этой командой.
 *
 * Использование:
 *   npm run create-company -- --name "ООО Ромашка" --inn 123456789 --email hr@romashka.uz --password "SomeStrongPass123"
 *
 * Требует SUPABASE_URL + SUPABASE_SECRET_KEY в apps/api/.env, и DATABASE_URL,
 * указывающий на тот же Supabase Postgres (иначе companies создаётся не в
 * той базе, где применена корпоративная схема/RLS).
 */
function parseArgs(): Record<string, string> {
  const out: Record<string, string> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : '';
      out[key] = value;
    }
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const { name, inn, email, password } = args;

  if (!name || !inn || !email || !password) {
    console.error('Usage: npm run create-company -- --name "Company LLC" --inn 123456789 --email hr@company.uz --password "StrongPass123"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('SUPABASE_URL / SUPABASE_SECRET_KEY are not set in apps/api/.env — cannot create an Auth user.');
    process.exit(1);
  }

  console.log(`Creating Supabase Auth user for ${email}...`);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    console.error('Failed to create Auth user:', error?.message ?? 'unknown error');
    process.exit(1);
  }

  console.log(`Auth user created (id=${data.user.id}). Inserting companies row...`);
  try {
    const company = await createCompany({ name, inn, authUserId: data.user.id });
    console.log('Company created:');
    console.log(JSON.stringify(company, null, 2));
    console.log('\nLogin credentials for the company:');
    console.log(`  email:    ${email}`);
    console.log(`  password: ${password}`);
  } catch (err) {
    console.error('Failed to insert companies row (Auth user was created — you may need to clean it up manually in Supabase Dashboard):', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
