import { Router } from 'express';
import { countAssessments } from '../db/assessmentsRepo.js';
import { countAllResponses } from '../db/responsesRepo.js';

export const statsRouter = Router();

/**
 * GET /api/stats/total-count — публичный, без авторизации. Считает
 * АБСОЛЮТНО все реально сохранённые расчёты: личные (/personal, с
 * телефоном и без — см. 0003_personal_anonymous_assessments.sql) плюс
 * корпоративные ответы сотрудников (/a/:token). Ничего, кроме одного
 * числа, не отдаёт — ни один из этих запросов не читает персональные
 * данные. Используется счётчиком "Уже прошли анализ: N человек" в hero
 * personal-лендинга.
 */
statsRouter.get('/total-count', async (_req, res) => {
  try {
    const [personalCount, corporateCount] = await Promise.all([countAssessments(), countAllResponses()]);
    res.json({ total: personalCount + corporateCount });
  } catch (err) {
    console.error('[stats] total-count failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});
