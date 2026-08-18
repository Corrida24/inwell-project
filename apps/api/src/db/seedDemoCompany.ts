import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { pool } from './pool.js';
import { createCompany } from './companiesRepo.js';
import { createAudit } from './auditsRepo.js';
import { insertResponseAtomic } from './responsesRepo.js';
import { computeFullReport } from '../calc/computeReport.js';
import { REGION_IDS } from '../regions.js';
import { ACTIVITY_KEYS } from '../validation.js';

/**
 * DEV/ТЕСТОВЫЙ скрипт — генерирует демо-компанию с одним аудитом и N
 * реалистично разнообразных анонимных ответов сотрудников, чтобы можно
 * было визуально проверить corporate dashboard на выборке 50+ человек.
 *
 * Это НЕ замена create-company.ts и НЕ часть продакшн-флоу: create-company.ts
 * создаёт компанию через настоящий Supabase Auth (auth.users управляется
 * Supabase). Этот скрипт вместо этого сам вставляет строку в auth.users —
 * что работает ТОЛЬКО на локальной тестовой базе с заглушкой схемы auth
 * (см. README/отчёт), а не на реальном Supabase, где auth.users управляется
 * сервисом Auth и прямые insert'ы в неё недопустимы. Использовать только
 * для локальной разработки/скриншотов, не для продакшна.
 *
 * Использование:
 *   DATABASE_URL=postgresql://... npx tsx src/db/seedDemoCompany.ts --count 50
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

const DEPARTMENTS = ['it', 'hr', 'sales', 'marketing', 'finance', 'accounting', 'other'] as const;
// Реалистичное распределение по отделам для условной компании ~50-60 человек
// (Sales и IT — крупнее, HR/Finance/Accounting — компактные бэк-офисные команды).
const DEPARTMENT_WEIGHTS: Record<(typeof DEPARTMENTS)[number], number> = {
  sales: 0.28,
  it: 0.22,
  marketing: 0.12,
  accounting: 0.1,
  finance: 0.1,
  hr: 0.08,
  other: 0.1,
};

function weightedPick<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const v = Math.random() * (max - min) + min;
  const p = 10 ** decimals;
  return Math.round(v * p) / p;
}

/** Генерирует одного синтетического сотрудника с физиологически
 * правдоподобными, но НАМЕРЕННО разнообразными измерениями — целевой BMI
 * выбирается по категориям с разным весом, чтобы получить смесь уровней
 * Inwell Score (не все "отлично" и не все "норма"), как просил пользователь. */
function generateEmployee(gender: 'M' | 'F', age: number) {
  // Целевая категория BMI: normal чаще всего, но заметная доля overweight/obese/underweight —
  // чтобы "Распределение по категориям" на дашборде было реалистично неоднородным.
  const bmiCategory = weightedPick({ underweight: 0.06, normal: 0.42, overweight: 0.34, obese: 0.18 });
  const bmiTarget =
    bmiCategory === 'underweight' ? randFloat(17, 18.4) : bmiCategory === 'normal' ? randFloat(18.5, 24.9) : bmiCategory === 'overweight' ? randFloat(25, 29.9) : randFloat(30, 37);

  const height = gender === 'M' ? randInt(165, 190) : randInt(153, 175);
  const heightM = height / 100;
  const weight = Math.round(bmiTarget * heightM * heightM * 10) / 10;

  // Обхваты — с реалистичным разбросом вокруг типичных пропорций для пола и веса,
  // плюс случайный шум, чтобы никакие два сотрудника не были идентичны.
  const waistBase = gender === 'M' ? 74 + (weight - 70) * 0.75 : 66 + (weight - 60) * 0.7;
  const waist = Math.max(55, Math.round((waistBase + randFloat(-4, 4)) * 10) / 10);
  const hipBase = gender === 'M' ? 92 + (weight - 70) * 0.35 : 92 + (weight - 60) * 0.55;
  const hip = Math.max(60, Math.round((hipBase + randFloat(-4, 4)) * 10) / 10);
  const chest = Math.max(65, Math.round((waist + (gender === 'M' ? 12 : 8) + randFloat(-3, 3)) * 10) / 10);
  const neck = gender === 'M' ? randFloat(35, 44) : randFloat(30, 37);
  const thighBase = gender === 'M' ? 52 + (weight - 70) * 0.25 : 52 + (weight - 60) * 0.35;
  const thighR = Math.max(38, Math.round((thighBase + randFloat(-2, 2)) * 10) / 10);
  const thighL = Math.max(38, Math.round((thighR + randFloat(-1.5, 1.5)) * 10) / 10);
  const bicepsBase = gender === 'M' ? 29 + (weight - 70) * 0.12 : 25 + (weight - 60) * 0.12;
  const bicepsR = Math.max(20, Math.round((bicepsBase + randFloat(-1.5, 1.5)) * 10) / 10);
  const bicepsL = Math.max(20, Math.round((bicepsR + randFloat(-1, 1)) * 10) / 10);

  return { gender, age, height, weight, waist, hip, chest, neck, thighR, thighL, bicepsR, bicepsL };
}

async function main() {
  const args = parseArgs();
  const name = args.name || 'ООО Demo Company';
  const inn = args.inn || String(randInt(100000000, 999999999));
  const count = Number(args.count || 50);
  const email = args.email || `demo-${Date.now()}@inwell-demo.local`;

  console.log(`[seed] creating LOCAL stub auth user + company "${name}" (INN ${inn})...`);
  const authUserId = randomUUID();
  await pool.query(`INSERT INTO auth.users (id, email) VALUES ($1, $2)`, [authUserId, email]);
  const company = await createCompany({ name, inn, authUserId });
  console.log(`[seed] company id=${company.id}`);

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);
  const deadlineStr = deadline.toISOString().slice(0, 10);

  const audit = await createAudit({
    companyId: company.id,
    name: 'Demo Wellness Audit 2026',
    deadline: deadlineStr,
    maxResponses: Math.max(60, count + 10),
    comment: 'Демо-аудит для проверки corporate dashboard (сгенерирован seedDemoCompany.ts).',
  });
  console.log(`[seed] audit id=${audit.id} publicToken=${audit.publicToken}`);

  const regionsPool = ['tashkent_city', 'tashkent_city', 'tashkent_city', 'tashkent_region', 'samarkand', 'fergana', 'bukhara', 'andijan'] as const;

  let inserted = 0;
  for (let i = 0; i < count; i++) {
    const gender: 'M' | 'F' = Math.random() < 0.52 ? 'M' : 'F';
    const age = randInt(21, 59);
    const department = weightedPick(DEPARTMENT_WEIGHTS);
    const region = regionsPool[randInt(0, regionsPool.length - 1)];
    const activityKey = ACTIVITY_KEYS[randInt(0, ACTIVITY_KEYS.length - 1)];
    const { gender: _g, age: _a, ...measurements } = generateEmployee(gender, age);
    void _g;
    void _a;

    const report = computeFullReport(
      {
        gender,
        age,
        activityKey,
        ...measurements,
        peers: [],
        previous: null,
      },
      'ru',
    );

    await insertResponseAtomic({
      auditId: audit.id,
      department,
      region,
      age,
      gender,
      activityKey,
      measurements,
      results: report,
    });
    inserted++;
  }

  console.log(`[seed] inserted ${inserted} responses.`);
  console.log('\nDemo login (LOCAL stub auth only — will NOT work against real Supabase):');
  console.log(`  email: ${email}`);
  console.log(`  company id: ${company.id}`);
  console.log(`  audit id: ${audit.id}`);
  console.log(`  public link: /a/${audit.publicToken}`);

  await pool.end();
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
