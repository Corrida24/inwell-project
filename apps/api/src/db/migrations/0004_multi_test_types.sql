-- Inwell — множественные типы корпоративных тестов.
--
-- До этой миграции корпоративный аудит был жёстко привязан к одному тесту
-- (фитнес-оценка): responses.measurements/activity_key были NOT NULL, а
-- расчёт всегда шёл через computeFullReport(). Теперь audits.test_type
-- определяет, какой тест проходят сотрудники по ссылке этого аудита
-- ("один аудит = один тип теста = одна ссылка"), а responses хранит либо
-- фитнес-измерения (measurements/activity_key), либо ответы опросника
-- (answers) — ровно одно из двух, в зависимости от test_type.
--
-- Валидация допустимых значений test_type — на уровне приложения (zod enum
-- в corporateValidation.ts), как и activity_key/region уже валидируются
-- сегодня без CHECK/FK в БД. Это осознанно: добавление нового типа теста —
-- это запись в registry.ts + расширение enum, без новой миграции.
--
-- Файл идемпотентен (как и остальные миграции — см. migrate.ts, они
-- применяются заново при каждом старте без отдельной таблицы версий).

ALTER TABLE audits ADD COLUMN IF NOT EXISTS test_type TEXT NOT NULL DEFAULT 'fitness';

-- Минимум ответов поднят с 1 до 15 — компании с меньшим числом сотрудников
-- не входят в целевой сегмент (см. implementation notes). NOT VALID —
-- чтобы не сломать уже существующие аудиты, созданные до этого изменения
-- (у них max_responses мог быть меньше 15); новые/изменяемые строки уже
-- проверяются по новому диапазону. Constraint пересоздаётся при каждом
-- запуске миграции (DROP IF EXISTS + ADD) — дёшево, т.к. NOT VALID не
-- перепроверяет существующие строки.
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_max_responses_check;
ALTER TABLE audits ADD CONSTRAINT audits_max_responses_check CHECK (max_responses BETWEEN 15 AND 100) NOT VALID;

-- Фитнес-специфичные поля — теперь опциональны (заполняются только для
-- test_type='fitness').
ALTER TABLE responses ALTER COLUMN measurements DROP NOT NULL;
ALTER TABLE responses ALTER COLUMN activity_key DROP NOT NULL;

-- Сырые ответы опросника (для test_type != 'fitness') — {questionId: number},
-- плюс необязательный открытый текстовый ответ хранится внутри results
-- (см. computeQuestionnaireReport / QuestionnaireReport.openText), а не
-- здесь отдельной колонкой. Держим answers рядом с measurements по той же
-- логике: "сырые данные" отдельно от "посчитанного результата" (results).
ALTER TABLE responses ADD COLUMN IF NOT EXISTS answers JSONB;
