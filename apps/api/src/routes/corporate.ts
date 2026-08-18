import { Router } from 'express';
import { requireCompanyAuth } from '../corporateAuth.js';
import { createAuditSchema } from '../corporateValidation.js';
import { countAuditsForCompany, createAudit, listAuditsForCompany, getAuditForCompany, MAX_AUDITS_PER_COMPANY } from '../db/auditsRepo.js';
import { getSafeResponsesForAudit } from '../db/responsesRepo.js';
import { buildAuditAggregation, type AuditFilters } from '../corporateAggregation.js';

export const corporateRouter = Router();

corporateRouter.use(requireCompanyAuth);

corporateRouter.get('/me', (req, res) => {
  const { id, name, inn } = req.company!;
  res.json({ id, name, inn });
});

corporateRouter.get('/audits', async (req, res) => {
  try {
    const audits = await listAuditsForCompany(req.company!.id);
    res.json({ audits });
  } catch (err) {
    console.error('[corporate] list audits failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

corporateRouter.post('/audits', async (req, res) => {
  const parsed = createAuditSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', details: parsed.error.flatten() });
  }

  try {
    const existingCount = await countAuditsForCompany(req.company!.id);
    if (existingCount >= MAX_AUDITS_PER_COMPANY) {
      return res.status(409).json({ error: 'audit_limit_reached' });
    }

    const audit = await createAudit({
      companyId: req.company!.id,
      name: parsed.data.name,
      deadline: parsed.data.deadline,
      maxResponses: parsed.data.maxResponses,
      comment: parsed.data.comment ? parsed.data.comment : null,
    });
    res.status(201).json({ audit });
  } catch (err) {
    console.error('[corporate] create audit failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

corporateRouter.get('/audits/:id', async (req, res) => {
  try {
    const audit = await getAuditForCompany(req.params.id, req.company!.id);
    if (!audit) {
      return res.status(404).json({ error: 'audit_not_found' });
    }
    res.json({ audit });
  } catch (err) {
    console.error('[corporate] get audit failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

corporateRouter.get('/audits/:id/results', async (req, res) => {
  try {
    // getAuditForCompany уже скоупит по company_id — если аудит принадлежит
    // другой компании, здесь придёт null и мы вернём 404 ДО того, как
    // тронем таблицу responses. Это и есть backend-level изоляция компаний,
    // а не только RLS.
    const audit = await getAuditForCompany(req.params.id, req.company!.id);
    if (!audit) {
      return res.status(404).json({ error: 'audit_not_found' });
    }

    const rows = await getSafeResponsesForAudit(audit.id);
    const filters: AuditFilters = {
      department: typeof req.query.department === 'string' && req.query.department ? req.query.department : undefined,
      gender: req.query.gender === 'M' || req.query.gender === 'F' ? req.query.gender : undefined,
      region: typeof req.query.region === 'string' && req.query.region ? req.query.region : undefined,
      ageBand: typeof req.query.ageBand === 'string' && req.query.ageBand ? req.query.ageBand : undefined,
      // office: пока нет такого поля в данных (см. AvailableFilters.offices в corporateAggregation.ts) —
      // параметр принимается для совместимости с UI-заглушкой, но ни на что не влияет.
      office: typeof req.query.office === 'string' && req.query.office ? req.query.office : undefined,
    };
    const lang = req.query.lang === 'uz' ? 'uz' : 'ru';
    const aggregation = buildAuditAggregation(rows, filters, lang);

    res.json({ audit, aggregation });
  } catch (err) {
    console.error('[corporate] audit results failed:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});
