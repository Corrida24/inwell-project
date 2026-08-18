import { z } from 'zod';
import { REGION_IDS } from './regions.js';
import { ACTIVITY_KEYS } from './validation.js';

/** YYYY-MM-DD, не в прошлом (сравнение по дате, не по времени — сегодняшний
 * день ещё считается допустимым дедлайном). */
const deadlineSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты')
  .refine((v) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return v >= todayStr;
  }, 'Дедлайн не может быть в прошлом');

export const createAuditSchema = z.object({
  name: z.string().trim().min(1, 'Обязательное поле').max(200),
  deadline: deadlineSchema,
  maxResponses: z
    .number()
    .int()
    .min(1, 'Минимум 1')
    .max(100, 'Количество сотрудников больше 100. Обсудите индивидуальную стоимость с администраторами проекта.'),
  comment: z.string().trim().max(2000).optional().or(z.literal('')),
});
export type CreateAuditInput = z.infer<typeof createAuditSchema>;

/** Тот же набор измерений, что и у personal-формы (validation.ts), но БЕЗ
 * phone/email (корпоративный ответ анонимен) и С department (единственное
 * corporate-specific поле по ТЗ). region оставлен — переиспользуется как
 * фильтр "город" на дашборде компании. */
export const corporateResponseInputSchema = z.object({
  department: z.string().trim().max(100).optional().or(z.literal('')),
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
export type CorporateResponseInput = z.infer<typeof corporateResponseInputSchema>;
