import { pool } from './pool.js';
import type { FullReport } from '../calc/computeReport.js';
import type { QuestionnaireReport } from '../calc/questionnaire/computeQuestionnaireReport.js';

/** Сколько всего корпоративных ответов сохранено, по всем компаниям и
 * аудитам вместе. Используется только для публичного счётчика "уже прошли
 * анализ" на лендинге personal — сотрудники бизнеса тоже прошли тот же
 * расчёт, поэтому тоже входят в общее число. Только count(*), без
 * привязки к конкретной компании/аудиту и без персональных данных. */
export async function countAllResponses(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(`SELECT count(*)::text AS count FROM responses`);
  return Number(rows[0]?.count ?? 0);
}

export class AuditNotFoundError extends Error {}
export class AuditExpiredError extends Error {}
export class AuditFullError extends Error {}

export interface InsertResponseInput {
  auditId: string;
  department: string | null;
  region: string;
  age: number;
  gender: 'M' | 'F';
  /** Ровно один из (activityKey+measurements) / answers заполнен, в
   * зависимости от test_type аудита — оба optional, каждый вызывающий код
   * (publicAudit.ts) передаёт только свою пару. */
  activityKey?: string;
  measurements?: Record<string, number>;
  answers?: Record<string, number>;
  results: FullReport | QuestionnaireReport;
  /** Headline-балл 0-100 для универсальной колонки responses.inwell_score —
   * раньше бралось напрямую из results.inwellScore (только фитнес-форма),
   * теперь передаётся явно каждым вызывающим кодом, т.к. у QuestionnaireReport
   * поле называется иначе (headlineScore). */
  inwellScore: number;
}

/**
 * Атомарная вставка ответа сотрудника с проверкой дедлайна и лимита.
 *
 * Механизм защиты от гонки (несколько сотрудников одновременно отправляют
 * 100-й ответ): `SELECT ... FOR UPDATE` блокирует строку audits на время
 * транзакции — вторая параллельная попытка ждёт на этой же блокировке, пока
 * первая не завершится (COMMIT/ROLLBACK), и только тогда делает свой
 * count(*) — который уже увидит только что вставленную первую запись.
 * Поэтому "перелимит" технически невозможен, даже при 100 одновременных
 * запросах на 1 свободное место — все они сериализуются в очередь по
 * конкретному audit_id (другие аудиты не блокируются).
 */
export async function insertResponseAtomic(input: InsertResponseInput): Promise<{ id: string }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const auditRes = await client.query<{ max_responses: number; is_expired: boolean }>(
      `SELECT max_responses, (deadline < CURRENT_DATE) AS is_expired FROM audits WHERE id = $1 FOR UPDATE`,
      [input.auditId],
    );
    const audit = auditRes.rows[0];
    if (!audit) {
      throw new AuditNotFoundError();
    }
    if (audit.is_expired) {
      throw new AuditExpiredError();
    }

    const countRes = await client.query<{ count: string }>(`SELECT count(*)::text AS count FROM responses WHERE audit_id = $1`, [input.auditId]);
    const count = Number(countRes.rows[0].count);
    if (count >= audit.max_responses) {
      throw new AuditFullError();
    }

    const insertRes = await client.query<{ id: string }>(
      `INSERT INTO responses (audit_id, department, region, age, gender, activity_key, measurements, answers, results, inwell_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        input.auditId,
        input.department,
        input.region,
        input.age,
        input.gender,
        input.activityKey ?? null,
        input.measurements ? JSON.stringify(input.measurements) : null,
        input.answers ? JSON.stringify(input.answers) : null,
        JSON.stringify(input.results),
        input.inwellScore,
      ],
    );

    await client.query('COMMIT');
    return insertRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Безопасная для компании форма одного ответа — намеренно БЕЗ
 * respondent_id и без каких-либо идентифицирующих полей (их и так нет в
 * таблице). Используется только для агрегации на дашборде, никогда не
 * отдаётся как "личный отчёт конкретного сотрудника". */
export interface SafeResponseRow {
  department: string | null;
  region: string;
  age: number;
  gender: 'M' | 'F';
  activityKey: string | null;
  answers: Record<string, number> | null;
  results: FullReport | QuestionnaireReport;
}

/** Все ответы аудита (без PII/respondent_id) — размер аудита ограничен 100
 * ответами, поэтому фильтрация/группировка по department/gender/age/region
 * для дашборда делается в коде (corporateAggregation.ts), а не в SQL.
 * answers добавлено ради агрегата лояльности (промоутеры/критики считаются
 * из сырого рейтинга, не из headline-балла — см. corporateAggregation.ts). */
export async function getSafeResponsesForAudit(auditId: string): Promise<SafeResponseRow[]> {
  const { rows } = await pool.query<{
    department: string | null;
    region: string;
    age: number;
    gender: 'M' | 'F';
    activity_key: string | null;
    answers: Record<string, number> | null;
    results: FullReport | QuestionnaireReport;
  }>(`SELECT department, region, age, gender, activity_key, answers, results FROM responses WHERE audit_id = $1 ORDER BY created_at ASC`, [auditId]);
  return rows.map((r) => ({ department: r.department, region: r.region, age: r.age, gender: r.gender, activityKey: r.activity_key, answers: r.answers, results: r.results }));
}
