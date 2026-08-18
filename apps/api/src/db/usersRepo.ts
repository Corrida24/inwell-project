import { pool } from './pool.js';

export interface UserRow {
  id: number;
  phone: string | null;
  email: string | null;
  region: string;
  gender: 'M' | 'F';
}

/** Находит пользователя по телефону либо создаёт нового; при повторной
 * отправке с тем же телефоном обновляет email/регион/пол (человек мог
 * опечататься в первый раз или у него изменились данные). Вызывается только
 * когда телефон указан — без телефона сравнивать не с чем, сохранять
 * анонимную запись незачем. */
export async function upsertUser(input: {
  phone: string;
  email: string | null;
  region: string;
  gender: 'M' | 'F';
}): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (phone, email, region, gender)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (phone) DO UPDATE
       SET email = EXCLUDED.email,
           region = EXCLUDED.region,
           gender = EXCLUDED.gender,
           updated_at = now()
     RETURNING id, phone, email, region, gender`,
    [input.phone, input.email, input.region, input.gender],
  );
  return rows[0];
}

/** Создаёт одноразовую анонимную строку users (phone = NULL) для отправки
 * без телефона — КАЖДЫЙ такой расчёт теперь тоже сохраняется (см.
 * 0003_personal_anonymous_assessments.sql), просто без возможности связать
 * его со следующим замером того же человека (нечем — нет идентификатора).
 * Ничего не апсертит и не переиспользует: один вызов = один новый user_id,
 * то есть один уникальный расчёт. */
export async function createAnonymousUser(input: { email: string | null; region: string; gender: 'M' | 'F' }): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (phone, email, region, gender)
     VALUES (NULL, $1, $2, $3)
     RETURNING id, phone, email, region, gender`,
    [input.email, input.region, input.gender],
  );
  return rows[0];
}
