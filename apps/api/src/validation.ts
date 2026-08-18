import { z } from 'zod';
import { isValidPhone } from './phone.js';
import { REGION_IDS } from './regions.js';

export const ACTIVITY_KEYS = ['sedentary', 'light', 'moderate', 'heavy', 'veryHeavy'] as const;

export const assessmentInputSchema = z.object({
  // Телефон необязателен: результат сохраняется в любом случае (см.
  // 0003_personal_anonymous_assessments.sql), но без телефона это
  // одноразовая анонимная запись — сравнить "через месяц" не с чем, потому
  // что нет идентификатора, по которому найти этот расчёт снова.
  phone: z
    .string()
    .refine(isValidPhone, 'Телефон должен быть в формате +998 XX XXX XX XX')
    .optional()
    .or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')).optional(),
  region: z.enum(REGION_IDS),
  gender: z.enum(['M', 'F']),
  age: z.number().int().min(12, 'Возраст от 12 до 99').max(99, 'Возраст от 12 до 99'),
  activityKey: z.enum(ACTIVITY_KEYS),
  height: z.number().min(50).max(250),
  weight: z.number().min(35).max(300),
  waist: z.number().min(40).max(250),
  hip: z.number().min(40).max(250),
  chest: z.number().min(40).max(250),
  neck: z.number().min(20).max(60),
  thighR: z.number().min(20).max(120),
  thighL: z.number().min(20).max(120),
  bicepsR: z.number().min(15).max(70),
  bicepsL: z.number().min(15).max(70),
  lang: z.enum(['ru', 'uz']).optional().default('ru'),
});

export type AssessmentInput = z.infer<typeof assessmentInputSchema>;
