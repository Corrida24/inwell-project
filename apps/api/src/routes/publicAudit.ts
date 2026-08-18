import { Router } from 'express';
import { corporateResponseInputSchema } from '../corporateValidation.js';
import { computeFullReport } from '../calc/computeReport.js';
import { getPeerAssessments } from '../db/assessmentsRepo.js';
import { getPublicAuditByToken } from '../db/auditsRepo.js';
import { insertResponseAtomic, AuditNotFoundError, AuditExpiredError, AuditFullError } from '../db/responsesRepo.js';

export const publicAuditRouter = Router();

/** GET /api/audits/:token — публичная информация для формы сотрудника (имя
 * компании + актуальный статус). Без авторизации, но и без раскрытия
 * ничего лишнего (см. getPublicAuditByToken). */
publicAuditRouter.get('/:token', async (req, res) => {
  try {
    const audit = await getPublicAuditByToken(req.params.token);
    if (!audit) {
      return res.status(404).json({ error: 'audit_not_found' });
    }
    res.json({ companyName: audit.companyName, status: audit.status });
  } catch (err) {
    console.error('[public audit] lookup failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

/** POST /api/audits/:token/responses — приём анонимного ответа сотрудника.
 * Переиспользует ТУ ЖЕ computeFullReport(), что и personal-форма — расчёты
 * не дублируются. Ничего идентифицирующего (телефон/email/имя) не
 * принимается и не сохраняется; previous всегда null (анонимно — сравнивать
 * "было -> стало" не с чем и не с кем). */
publicAuditRouter.post('/:token/responses', async (req, res) => {
  const parsed = corporateResponseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', details: parsed.error.flatten() });
  }
  const input = parsed.data;

  try {
    const audit = await getPublicAuditByToken(req.params.token);
    if (!audit) {
      return res.status(404).json({ error: 'audit_not_found' });
    }

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
