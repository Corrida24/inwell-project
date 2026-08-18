import { Router } from 'express';
import { assessmentInputSchema } from '../validation.js';
import { normalizePhone } from '../phone.js';
import { computeFullReport } from '../calc/computeReport.js';
import { upsertUser, createAnonymousUser } from '../db/usersRepo.js';
import { insertAssessment, getPeerAssessments, getLatestAssessmentForUser } from '../db/assessmentsRepo.js';

export const assessmentsRouter = Router();

assessmentsRouter.post('/', async (req, res) => {
  const parsed = assessmentInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', details: parsed.error.flatten() });
  }
  const input = parsed.data;

  try {
    // Телефон необязателен, но результат теперь СОХРАНЯЕТСЯ в любом случае
    // (см. 0003_personal_anonymous_assessments.sql) — нужно для счётчика
    // "уже прошли анализ" на лендинге и для percentile/peer-выборки по всем
    // расчётам, а не только по тем, кто оставил телефон. Разница только в
    // том, привязан ли расчёт к телефону: если да — это учитывается для
    // "Динамики" (сравнение с прошлым замером того же человека) и следующая
    // отправка с тем же номером сможет её показать; если нет — сохраняется
    // как одноразовая анонимная запись (createAnonymousUser), без истории.
    let userId: number;
    let trackable: boolean;
    let previous = null as Awaited<ReturnType<typeof getLatestAssessmentForUser>>;

    if (input.phone) {
      const phone = normalizePhone(input.phone);
      if (!phone) {
        return res.status(400).json({ error: 'invalid_phone' });
      }
      const user = await upsertUser({
        phone,
        email: input.email || null,
        region: input.region,
        gender: input.gender,
      });
      userId = user.id;
      trackable = true;
      previous = await getLatestAssessmentForUser(user.id);
    } else {
      const user = await createAnonymousUser({
        email: input.email || null,
        region: input.region,
        gender: input.gender,
      });
      userId = user.id;
      trackable = false;
    }

    const peers = await getPeerAssessments(input.gender, userId);

    const measurements = {
      height: input.height,
      weight: input.weight,
      waist: input.waist,
      hip: input.hip,
      chest: input.chest,
      neck: input.neck,
      bicepsR: input.bicepsR,
      bicepsL: input.bicepsL,
      thighR: input.thighR,
      thighL: input.thighL,
    };

    const report = computeFullReport(
      {
        gender: input.gender,
        age: input.age,
        activityKey: input.activityKey,
        ...measurements,
        peers,
        previous,
      },
      input.lang,
    );

    // Теперь всегда — и с телефоном, и без (userId в обоих случаях уже
    // существует, см. выше). Каждая строка — свой уникальный id.
    await insertAssessment({
      userId,
      age: input.age,
      activityKey: input.activityKey,
      measurements,
      results: report,
    });

    // saved — теперь всегда true (реально сохраняется всегда). trackable —
    // отдельно показывает, привязан ли расчёт к телефону (то есть можно ли
    // будет показать "Динамику" при следующей отправке с тем же номером);
    // фронтенд использует именно его для выбора текста под заголовком отчёта.
    res.json({ report, saved: true, trackable });
  } catch (err) {
    console.error('[assessments] failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});
