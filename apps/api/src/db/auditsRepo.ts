import { randomBytes } from 'node:crypto';
import { pool } from './pool.js';

export const MAX_AUDITS_PER_COMPANY = 10;
export const MAX_RESPONSES_PER_AUDIT = 100;

export type AuditStatus = 'active' | 'full' | 'expired';

export interface AuditListItem {
  id: string;
  name: string;
  deadline: string; // YYYY-MM-DD
  maxResponses: number;
  comment: string | null;
  publicToken: string;
  responseCount: number;
  status: AuditStatus;
  createdAt: string;
}

/** urlsafe, непредсказуемый — НЕ последовательный id. 24 случайных байта =
 * 32 символа base64url, достаточно энтропии, чтобы ссылку нельзя было
 * подобрать/угадать. */
export function generatePublicToken(): string {
  return randomBytes(24).toString('base64url');
}

export async function countAuditsForCompany(companyId: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(`SELECT count(*)::text AS count FROM audits WHERE company_id = $1`, [companyId]);
  return Number(rows[0]?.count ?? 0);
}

/** Список аудитов компании со ЖИВЫМ статусом (deadline/лимит пересчитаны на
 * лету через audit_effective_status(), а не читаются из колонки status —
 * см. комментарий в db/migrations/0002_corporate_schema.sql). */
export async function listAuditsForCompany(companyId: string): Promise<AuditListItem[]> {
  const { rows } = await pool.query(
    `SELECT
       a.id, a.name, a.deadline::text AS deadline, a.max_responses, a.comment, a.public_token, a.created_at,
       count(r.id)::int AS response_count,
       audit_effective_status(a.deadline, a.max_responses, count(r.id)) AS status
     FROM audits a
     LEFT JOIN responses r ON r.audit_id = a.id
     WHERE a.company_id = $1
     GROUP BY a.id
     ORDER BY a.created_at DESC`,
    [companyId],
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    deadline: row.deadline,
    maxResponses: row.max_responses,
    comment: row.comment,
    publicToken: row.public_token,
    responseCount: row.response_count,
    status: row.status,
    createdAt: row.created_at,
  }));
}

/** Деталь одного аудита, СКОУПЛЕННАЯ по company_id — если аудит принадлежит
 * другой компании, вернёт null (а не чужие данные). Это тот самый
 * backend-level контроль доступа, который не полагается только на RLS. */
export async function getAuditForCompany(auditId: string, companyId: string): Promise<AuditListItem | null> {
  const { rows } = await pool.query(
    `SELECT
       a.id, a.name, a.deadline::text AS deadline, a.max_responses, a.comment, a.public_token, a.created_at,
       count(r.id)::int AS response_count,
       audit_effective_status(a.deadline, a.max_responses, count(r.id)) AS status
     FROM audits a
     LEFT JOIN responses r ON r.audit_id = a.id
     WHERE a.id = $1 AND a.company_id = $2
     GROUP BY a.id`,
    [auditId, companyId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    deadline: row.deadline,
    maxResponses: row.max_responses,
    comment: row.comment,
    publicToken: row.public_token,
    responseCount: row.response_count,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createAudit(input: { companyId: string; name: string; deadline: string; maxResponses: number; comment: string | null }): Promise<AuditListItem> {
  const token = generatePublicToken();
  const { rows } = await pool.query(
    `INSERT INTO audits (company_id, name, deadline, max_responses, comment, public_token)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, deadline::text AS deadline, max_responses, comment, public_token, created_at`,
    [input.companyId, input.name, input.deadline, input.maxResponses, input.comment, token],
  );
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    deadline: row.deadline,
    maxResponses: row.max_responses,
    comment: row.comment,
    publicToken: row.public_token,
    responseCount: 0,
    status: 'active',
    createdAt: row.created_at,
  };
}

export interface PublicAuditInfo {
  id: string;
  companyName: string;
  status: AuditStatus;
}

/** Публичная информация об аудите по токену — без раскрытия company_id/ИНН/
 * количества ответов и прочих внутренних деталей, только то, что нужно
 * форме сотрудника (название компании + статус). */
export async function getPublicAuditByToken(token: string): Promise<PublicAuditInfo | null> {
  const { rows } = await pool.query(
    `SELECT a.id, c.name AS company_name,
       audit_effective_status(a.deadline, a.max_responses, count(r.id)) AS status
     FROM audits a
     JOIN companies c ON c.id = a.company_id
     LEFT JOIN responses r ON r.audit_id = a.id
     WHERE a.public_token = $1
     GROUP BY a.id, c.name`,
    [token],
  );
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, companyName: row.company_name, status: row.status };
}
