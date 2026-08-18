import { pool } from './pool.js';
import type { FullReport } from '../calc/computeReport.js';

export async function insertAssessment(params: {
  userId: number;
  age: number;
  activityKey: string;
  measurements: Record<string, number>;
  results: FullReport;
}): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO assessments (user_id, age, activity_key, measurements, results, inwell_score)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [params.userId, params.age, params.activityKey, JSON.stringify(params.measurements), JSON.stringify(params.results), params.results.inwellScore],
  );
  return rows[0].id;
}

/** Сколько всего личных расчётов сохранено (с телефоном и без — с
 * 0003_personal_anonymous_assessments.sql сохраняются все). Используется
 * только для публичного счётчика "уже прошли анализ" на лендинге — просто
 * count(*), никаких персональных данных не возвращает. */
export async function countAssessments(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(`SELECT count(*)::text AS count FROM assessments`);
  return Number(rows[0]?.count ?? 0);
}

export interface PeerAssessment {
  measurements: Record<string, number>;
  results: FullReport;
}

/** Последний замер каждого другого пользователя того же пола — источник
 * выборки для "перцентиль по базе Inwell" (inwellScore, сырые измерения и
 * расчётные показатели все считают перцентиль по одной и той же выборке).
 * Не включает текущего пользователя, если он уже существует (excludeUserId). */
export async function getPeerAssessments(gender: 'M' | 'F', excludeUserId?: number | null): Promise<PeerAssessment[]> {
  const { rows } = await pool.query<{ measurements: Record<string, number>; results: FullReport }>(
    `SELECT a.measurements, a.results
     FROM latest_assessments la
     JOIN assessments a ON a.id = la.id
     WHERE la.gender = $1 AND la.user_id IS DISTINCT FROM $2`,
    [gender, excludeUserId ?? null],
  );
  return rows;
}

export interface PreviousAssessment {
  measurements: Record<string, number>;
  results: FullReport;
  createdAt: string;
}

/** Самый свежий замер ЭТОГО пользователя (до сохранения текущего) — основа
 * для секции "Динамика" (вес/талия/BMI: было -> стало). */
export async function getLatestAssessmentForUser(userId: number): Promise<PreviousAssessment | null> {
  const { rows } = await pool.query<{ measurements: Record<string, number>; results: FullReport; created_at: string }>(
    `SELECT measurements, results, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId],
  );
  if (!rows[0]) return null;
  return { measurements: rows[0].measurements, results: rows[0].results, createdAt: rows[0].created_at };
}
