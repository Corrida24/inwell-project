import 'dotenv/config';
import { pool } from './pool.js';
import { createAudit } from './auditsRepo.js';
import { computeFullReport } from '../calc/computeReport.js';
import { computeQuestionnaireReport } from '../calc/questionnaire/computeQuestionnaireReport.js';
import { TEST_DEFINITIONS } from '../calc/questionnaire/registry.js';
import { TEST_LABEL_CONTENT } from '../calc/questionnaire/content.js';
import { TEST_TYPES, type TestType } from '@inwell/shared';
import { REGION_IDS } from '../regions.js';
import { ACTIVITY_KEYS } from '../validation.js';

/**
 * Заполняет РЕАЛЬНУЮ существующую демо-компанию (demo@inwell.uz) данными по
 * ВСЕМ 6 типам тестов сразу — по одному аудиту на тип (существующий
 * оставляем как есть, только продлеваем дедлайн; недостающий создаём), и
 * добавляет случайных ответов до случайной цели в 200-300 на аудит.
 *
 * В ОТЛИЧИЕ от seedDemoCompany.ts (см. его комментарий) этот скрипт НЕ
 * трогает auth.users — предполагает, что demo@inwell.uz УЖЕ существует как
 * настоящий Supabase Auth пользователь (компания создана заранее через
 * create-company.ts), и просто ищет компанию по email через JOIN с
 * auth.users. Поэтому этот скрипт безопасен для запуска против настоящего
 * продакшн Supabase — он не пытается вставить строку в auth.users.
 *
 * Вставка ответов — ОДИН bulk INSERT (через unnest()) на аудит, а не по
 * одному запросу на человека — именно то, о чём просили ("а не по 300
 * запросов отправлять"). За весь прогон это максимум 6 insert-запросов
 * (по одному на тип теста), а не сотни.
 *
 * Разброс данных (по требованию):
 *  - пол: примерно 50/50 (с лёгким случайным перекосом на человека);
 *  - возраст: 21-59, равномерно;
 *  - день отправки: случайная дата за последние --days дней (по умолчанию
 *    45) со случайным временем суток — так на новой карточке "заполнение по
 *    дням" будет реальный разброс, а не все ответы в одну секунду;
 *  - ответы на вопросы: НЕ чистый случайный шум — у каждого синтетического
 *    человека есть скрытая "склонность" (trait, 0..1) с небольшим
 *    систематическим сдвигом по возрастной группе и полу (см. traitFor) —
 *    ИМЕННО ради этого сдвига на новых карточках "по возрасту"/"по полу" на
 *    странице результатов будут заметно разные числа, а не одинаковые
 *    средние everywhere. Сдвиги нарочно небольшие и не претендуют на
 *    реальную психологическую закономерность — это демо-данные для проверки
 *    UI, а не исследование.
 *
 * Идемпотентность: если у аудита уже есть >= целевого количества ответов
 * (случайная цель 200-300 на каждый запуск), скрипт просто пропускает
 * досыпку для этого аудита, а не дублирует по новой порции при каждом
 * запуске.
 *
 * Использование (обязательно с ДОСТУПНЫМ до Supabase DATABASE_URL —
 * см. HOW_TO_APPLY.txt в поставке этого изменения; из песочницы, где
 * готовился этот код, прямого сетевого доступа к Supabase нет, поэтому
 * запускать нужно из окружения, у которого есть доступ, например с вашего
 * компьютера):
 *
 *   DATABASE_URL=postgresql://...supabase... npx tsx src/db/seedDemoAllTests.ts
 *
 * Необязательные флаги:
 *   --email demo@inwell.uz   (кого искать; по умолчанию demo@inwell.uz)
 *   --min 200 --max 300      (диапазон случайной цели ответов на аудит)
 *   --days 45                 (окно в днях, за которое разбрасываются даты отправки)
 *   --deadlineDays 90          (на сколько дней вперёд продлить дедлайн всех аудитов)
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

/** Та же генерация физиологически правдоподобного тела, что в
 * seedDemoCompany.ts (продублирована здесь намеренно — этот файл должен
 * оставаться самодостаточным, без общего модуля ради одной функции). */
function generateEmployee(gender: 'M' | 'F', age: number) {
  const bmiCategory = weightedPick({ underweight: 0.06, normal: 0.42, overweight: 0.34, obese: 0.18 });
  const bmiTarget =
    bmiCategory === 'underweight' ? randFloat(17, 18.4) : bmiCategory === 'normal' ? randFloat(18.5, 24.9) : bmiCategory === 'overweight' ? randFloat(25, 29.9) : randFloat(30, 37);

  const height = gender === 'M' ? randInt(165, 190) : randInt(153, 175);
  const heightM = height / 100;
  const weight = Math.round(bmiTarget * heightM * heightM * 10) / 10;

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

  return { height, weight, waist, hip, chest, neck, thighR, thighL, bicepsR, bicepsL };
}

/** Скрытая "склонность" синтетического человека (0..1), с небольшим
 * систематическим сдвигом по возрастной группе и полу — специально, чтобы
 * агрегаты "по возрасту"/"по полу" на дашборде реально отличались друг от
 * друга (иначе новые карточки на странице результатов показывали бы везде
 * одно и то же число, и демо ничего бы не демонстрировало). Сдвиги
 * небольшие и не претендуют на реальную закономерность. */
function traitFor(age: number, gender: 'M' | 'F'): number {
  const base = Math.random();
  const ageOffset = age < 30 ? -0.05 : age < 40 ? 0 : age < 50 ? 0.07 : 0.12;
  const genderOffset = gender === 'F' ? 0.03 : -0.03;
  const trait = base * 0.7 + 0.15 + ageOffset + genderOffset;
  return Math.max(0.05, Math.min(0.95, trait));
}

function questionnaireAnswers(scaleMin: number, scaleMax: number, questionIds: number[], trait: number): Record<number, number> {
  const answers: Record<number, number> = {};
  for (const id of questionIds) {
    const noise = (Math.random() - 0.5) * 0.4; // +-0.2 вокруг trait — у разных вопросов немного разные ответы, не идентичные
    const v = Math.max(0, Math.min(1, trait + noise));
    answers[id] = Math.round(scaleMin + v * (scaleMax - scaleMin));
  }
  return answers;
}

const LOYALTY_COMMENTS_RU = [
  'В целом всё устраивает, хотелось бы больше обратной связи от руководителя.',
  'Нравится команда и гибкий график.',
  'Не хватает прозрачности в вопросах роста и премий.',
  'Часто переработки, устаю к концу недели.',
  'Хорошая атмосфера, но мало возможностей для обучения.',
];

function randomOpenText(): string | undefined {
  if (Math.random() < 0.35) return undefined; // не все оставляют комментарий
  return LOYALTY_COMMENTS_RU[randInt(0, LOYALTY_COMMENTS_RU.length - 1)];
}

function randomCreatedAt(days: number): Date {
  const now = Date.now();
  const dayOffsetMs = randInt(0, days) * 24 * 3600 * 1000;
  const timeOfDayMs = randInt(0, 24 * 3600 * 1000 - 1);
  return new Date(now - dayOffsetMs - (24 * 3600 * 1000 - timeOfDayMs));
}

interface RowInput {
  department: string;
  region: string;
  age: number;
  gender: 'M' | 'F';
  activityKey: string | null;
  measurements: Record<string, number> | null;
  results: unknown;
  answers: Record<number, number> | null;
  inwellScore: number;
  createdAt: Date;
}

/** ОДИН bulk INSERT на аудит (через unnest над JS-массивами), вместо
 * insertResponseAtomic() в цикле — см. комментарий вверху файла про "не по
 * 300 запросов". respondent_id не передаём — берёт DEFAULT gen_random_uuid()
 * из схемы, как и для обычных ответов. */
async function bulkInsertResponses(auditId: string, rows: RowInput[]): Promise<void> {
  if (rows.length === 0) return;
  const department = rows.map((r) => r.department);
  const region = rows.map((r) => r.region);
  const age = rows.map((r) => r.age);
  const gender = rows.map((r) => r.gender);
  const activityKey = rows.map((r) => r.activityKey);
  const measurements = rows.map((r) => (r.measurements ? JSON.stringify(r.measurements) : null));
  const results = rows.map((r) => JSON.stringify(r.results));
  const answers = rows.map((r) => (r.answers ? JSON.stringify(r.answers) : null));
  const inwellScore = rows.map((r) => r.inwellScore);
  const createdAt = rows.map((r) => r.createdAt.toISOString());

  await pool.query(
    `INSERT INTO responses (audit_id, department, region, age, gender, activity_key, measurements, results, answers, inwell_score, created_at)
     SELECT $1, d, r, a, g, ak, m, res, ans, sc, ca
     FROM unnest($2::text[], $3::text[], $4::int[], $5::text[], $6::text[], $7::jsonb[], $8::jsonb[], $9::jsonb[], $10::int[], $11::timestamptz[])
       AS t(d, r, a, g, ak, m, res, ans, sc, ca)`,
    [auditId, department, region, age, gender, activityKey, measurements, results, answers, inwellScore, createdAt],
  );
}

async function findCompanyByEmail(email: string): Promise<{ id: string; name: string } | null> {
  const { rows } = await pool.query<{ id: string; name: string }>(
    `SELECT c.id, c.name FROM companies c JOIN auth.users u ON u.id = c.auth_user_id WHERE u.email = $1 LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

async function findAuditForTestType(companyId: string, testType: TestType): Promise<{ id: string; publicToken: string } | null> {
  const { rows } = await pool.query<{ id: string; public_token: string }>(
    `SELECT id, public_token FROM audits WHERE company_id = $1 AND test_type = $2 ORDER BY created_at ASC LIMIT 1`,
    [companyId, testType],
  );
  const row = rows[0];
  return row ? { id: row.id, publicToken: row.public_token } : null;
}

async function extendDeadline(auditId: string, deadlineStr: string): Promise<void> {
  await pool.query(`UPDATE audits SET deadline = $1 WHERE id = $2`, [deadlineStr, auditId]);
}

async function countResponses(auditId: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(`SELECT count(*)::text AS count FROM responses WHERE audit_id = $1`, [auditId]);
  return Number(rows[0]?.count ?? 0);
}

function auditNameFor(testType: TestType): string {
  if (testType === 'fitness') return 'Demo — Физическая оценка';
  return `Demo — ${TEST_LABEL_CONTENT.ru[testType].headlineLabel}`;
}

async function main() {
  const args = parseArgs();
  const email = args.email || 'demo@inwell.uz';
  const minTarget = Number(args.min || 200);
  const maxTarget = Number(args.max || 300);
  const dayWindow = Number(args.days || 45);
  const deadlineDays = Number(args.deadlineDays || 90);

  console.log(`[seed-all] looking up existing company by email ${email} (via auth.users join)...`);
  const company = await findCompanyByEmail(email);
  if (!company) {
    console.error(`[seed-all] no company found for ${email} — this script does NOT create the auth user or the company (see file header). Create it first via create-company.ts / the Supabase dashboard.`);
    await pool.end();
    process.exit(1);
  }
  console.log(`[seed-all] company "${company.name}" (id=${company.id})`);

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + deadlineDays);
  const deadlineStr = deadline.toISOString().slice(0, 10);

  const regionsPool = ['tashkent_city', 'tashkent_city', 'tashkent_city', 'tashkent_region', 'samarkand', 'fergana', 'bukhara', 'andijan'].filter((r) =>
    (REGION_IDS as readonly string[]).includes(r),
  );

  for (const testType of TEST_TYPES) {
    console.log(`\n--- ${testType} ---`);
    let audit = await findAuditForTestType(company.id, testType);
    if (!audit) {
      const created = await createAudit({
        companyId: company.id,
        name: auditNameFor(testType),
        testType,
        deadline: deadlineStr,
        maxResponses: 500,
        comment: 'Демо-аудит (сгенерирован seedDemoAllTests.ts).',
      });
      audit = { id: created.id, publicToken: created.publicToken };
      console.log(`[seed-all] created new audit id=${audit.id}`);
    } else {
      await extendDeadline(audit.id, deadlineStr);
      console.log(`[seed-all] reusing existing audit id=${audit.id}, deadline extended to ${deadlineStr}`);
    }

    const target = randInt(minTarget, maxTarget);
    const existing = await countResponses(audit.id);
    const toAdd = target - existing;
    if (toAdd <= 0) {
      console.log(`[seed-all] already has ${existing} responses (>= target ${target}) — skipping insert.`);
      console.log(`[seed-all] public link: /a/${audit.publicToken}`);
      continue;
    }
    console.log(`[seed-all] has ${existing}, target ${target} -> generating ${toAdd} more (bulk insert)...`);

    const rows: RowInput[] = [];
    for (let i = 0; i < toAdd; i++) {
      const gender: 'M' | 'F' = Math.random() < 0.5 ? 'M' : 'F';
      const age = randInt(21, 59);
      const department = weightedPick(DEPARTMENT_WEIGHTS);
      const region = regionsPool[randInt(0, regionsPool.length - 1)];
      const createdAt = randomCreatedAt(dayWindow);

      if (testType === 'fitness') {
        const activityKey = ACTIVITY_KEYS[randInt(0, ACTIVITY_KEYS.length - 1)];
        const measurements = generateEmployee(gender, age);
        const report = computeFullReport({ gender, age, activityKey, ...measurements, peers: [], previous: null }, 'ru');
        rows.push({
          department,
          region,
          age,
          gender,
          activityKey,
          measurements,
          results: report,
          answers: null,
          inwellScore: report.inwellScore,
          createdAt,
        });
      } else {
        const def = TEST_DEFINITIONS[testType];
        const questionIds = def.questions.map((q) => q.id);
        const trait = traitFor(age, gender);
        const answers = questionnaireAnswers(def.scaleMin, def.scaleMax, questionIds, trait);
        const openText = testType === 'loyalty' ? randomOpenText() : undefined;
        const report = computeQuestionnaireReport(testType, answers, openText);
        rows.push({
          department,
          region,
          age,
          gender,
          activityKey: null,
          measurements: null,
          results: report,
          answers,
          inwellScore: report.headlineScore,
          createdAt,
        });
      }
    }

    await bulkInsertResponses(audit.id, rows);
    console.log(`[seed-all] inserted ${rows.length} responses in one bulk query.`);
    console.log(`[seed-all] public link: /a/${audit.publicToken}`);
  }

  console.log('\n[seed-all] done.');
  await pool.end();
}

main().catch((err) => {
  console.error('[seed-all] failed:', err);
  process.exit(1);
});
