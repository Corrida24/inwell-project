import { pool } from './pool.js';

export interface CompanyRow {
  id: string;
  name: string;
  inn: string;
  auth_user_id: string;
  created_at: string;
}

export async function getCompanyByAuthUserId(authUserId: string): Promise<CompanyRow | null> {
  const { rows } = await pool.query<CompanyRow>(`SELECT id, name, inn, auth_user_id, created_at FROM companies WHERE auth_user_id = $1`, [authUserId]);
  return rows[0] ?? null;
}

export async function createCompany(input: { name: string; inn: string; authUserId: string }): Promise<CompanyRow> {
  const { rows } = await pool.query<CompanyRow>(
    `INSERT INTO companies (name, inn, auth_user_id) VALUES ($1, $2, $3) RETURNING id, name, inn, auth_user_id, created_at`,
    [input.name, input.inn, input.authUserId],
  );
  return rows[0];
}
