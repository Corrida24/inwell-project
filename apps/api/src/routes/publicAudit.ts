import { Router } from 'express';
import { corporateResponseInputSchema, questionnaireResponseInputSchema } from '../corporateValidation.js';
import { computeFullReport } from '../calc/computeReport.js';
import { computeQuestionnaireReport, InvalidAnswersError } from '../calc/questionnaire/computeQuestionnaireReport.js';
import { isQuestionnaireTestKey } from '../calc/questionnaire/types.js';
import { getPeerAssessments } from '../db/assessmentsRepo.js';
import { getPublicAuditByToken } from '../db/auditsRepo.js';
import { insertResponseAtomic, AuditNotFoundError, AuditExpiredError, AuditFullError } from '../db/responsesRepo.js';

export const publicAuditRouter = Router();

/** GET /api/audits/:token — публичная информация для формы сотрудника (имя
 * компании + тип теста + актуальный статус). Без авторизации, но и без
 * раскрытия ничего лишнего (см. getPublicAuditByToken). testType решает,
 * какую форму фронтенд покажет — IntakeForm (fitness) или QuestionnaireForm
 * (5 новых тестов). */
publicAuditRouter.get('/:token', async (req, res) => {
  try {
    const audit = await getPublicAuditByToken(req.params.token);
    if (!audit) {
      return res.status(404).json({ error: 'audit_not_found' });
    }
    res.json({ companyName: audit.companyName, testType: audit.testType, status: audit.status });
  } catch (err) {
    console.error('[public audit] lookup failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

/** POST /api/audits/:token/responses — приём анонимного ответа сотрудника.
 * Ничего идентифицирующего (телефон/email/имя) не принимается и не
 * сохраняется. Ветвится по audit.testType:
 *  - 'fitness' — путь НЕ ИЗМЕНЁН: та же computeFullReport(), что и
 *    personal-форма, previous всегда null (анонимно, сравнивать не с чем).
 *  - остальные 5 — новый generic-движок computeQuestionnaireReport(). */
publicAuditRouter.post('/:token/responses', async (req, res) => {
  try {
    const audit = await getPublicAuditByToken(req.params.token);
    if (!audit) {
      return res.status(404).json({ error: 'audit_not_found' });
    }

    if (audit.testType === 'fitness') {
      const parsed = corporateResponseInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'validation_failed', details: parsed.error.flatten() });
      }
      const input = parsed.data;

      const peers = await getPeerAssessments(input.gender, null);

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
          previous: null,
        },
        input.lang,
      );

      await insertResponseAtomic({
        auditId: audit.id,
        department: input.department ? input.department : null,
        region: input.region,
        age: input.age,
        gender: input.gender,
        activityKey: input.activityKey,
        measurements,
        results: report,
        inwellScore: report.inwellScore,
      });

      return res.json({ report, saved: true });
    }

    if (!isQuestionnaireTestKey(audit.testType)) {
      // Не должно случаться (testType валидируется при создании аудита),
      // но защищаемся от рассинхронизации данных/кода на всякий случай.
      console.error('[public audit] unknown test type on audit:', audit.testType);
      return res.status(500).json({ error: 'internal_error' });
    }

    const parsed = questionnaireResponseInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'validation_failed', details: parsed.error.flatten() });
    }
    const input = parsed.data;

    // answers приходит с string-ключами (JSON), registry ждёт number id.
    const numericAnswers: Record<number, number> = {};
    for (const [k, v] of Object.entries(input.answers)) {
      numericAnswers[Number(k)] = v;
    }

    let report;
    try {
      report = computeQuestionnaireReport(audit.testType, numericAnswers, input.openText);
    } catch (err) {
      if (err instanceof InvalidAnswersError) {
        return res.status(400).json({ error: 'validation_failed', details: { formErrors: [err.message], fieldErrors: {} } });
      }
      throw err;
    }

    await insertResponseAtomic({
      auditId: audit.id,
      department: input.department ? input.department : null,
      region: input.region,
      age: input.age,
      gender: input.gender,
      answers: input.answers,
      results: report,
      inwellScore: report.headlineScore,
    });

    res.json({ report, saved: true });
  } catch (err) {
    if (err instanceof AuditNotFoundError) {
      return res.status(404).json({ error: 'audit_not_found' });
    }
    if (err instanceof AuditExpiredError) {
      return res.status(410).json({ error: 'audit_expired' });
    }
    if (err instanceof AuditFullError) {
      return res.status(409).json({ error: 'audit_full' });
    }
    console.error('[public audit] submit failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});
