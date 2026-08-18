-- Inwell — корпоративная схема (Supabase Postgres).
--
-- ЗАВИСИМОСТЬ ОТ SUPABASE: эта схема ссылается на auth.users (управляется
-- Supabase Auth) и включает RLS-политики, использующие auth.uid(). База
-- данных проекта — ТОЛЬКО Supabase Postgres (единственная база, без
-- локального Docker Postgres как fallback), поэтому auth.users здесь всегда
-- должна существовать. migrate.ts на всякий случай ловит ошибку "schema
-- auth does not exist" и не роняет процесс — это не переключение на другую
-- базу, а просто защита самого шага миграции (например, если её случайно
-- запустят раньше, чем Supabase успеет полностью инициализировать проект).
--
-- Модель данных:
--   company (1)  ->  audits (N)  ->  responses (N)
-- responses НЕ связаны с personal.users — корпоративное прохождение
-- полностью анонимно (без телефона/email/имени), поэтому это отдельная
-- таблица, а не переиспользование assessments. Расчёты (computeFullReport)
-- при этом переиспользуются как есть — см. apps/api/src/routes/corporate.ts.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- companies — одна строка = один корпоративный аккаунт. Создаётся ТОЛЬКО
-- вручную (админ-скрипт db/createCompany.ts), публичной регистрации нет.
-- auth_user_id — ссылка на пользователя Supabase Auth (email+password),
-- через которого компания логинится.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  inn           TEXT NOT NULL,
  auth_user_id  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- audits — один корпоративный опросник. Создаётся компанией через дашборд,
-- после создания НЕ редактируется и НЕ удаляется (см. спецификацию MVP).
-- public_token генерируется на бэкенде (crypto.randomBytes, urlsafe) — не
-- последовательный id, непредсказуем.
-- status — поле-заглушка (default 'active'), реальный статус ВСЕГДА
-- пересчитывается на лету (deadline + count(responses) vs max_responses),
-- см. audit_effective_status() ниже и routes/corporate.ts. Хранимому
-- значению status нигде не доверяем для авторизации/лимитов.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  deadline       DATE NOT NULL,
  max_responses  SMALLINT NOT NULL CHECK (max_responses BETWEEN 1 AND 100),
  comment        TEXT,
  public_token   TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audits_company_id ON audits (company_id);
CREATE INDEX IF NOT EXISTS idx_audits_public_token ON audits (public_token);

-- ---------------------------------------------------------------------------
-- responses — один пройденный опрос сотрудником. Анонимно: НЕТ телефона,
-- email, имени. respondent_id — случайный uuid, никогда не отдаётся
-- компании (см. routes/corporate.ts — агрегирующие запросы его не
-- выбирают). measurements/results зеркалят структуру assessments
-- (schema.sql), чтобы отчёт сотрудника строился той же функцией
-- computeFullReport() без дублирования логики.
-- ---------------------------------------------------------------------------
-- region переиспользует то же поле, что и personal-форма (REGION_IDS,
-- см. apps/api/src/regions.ts) — это и есть "город" в фильтрах дашборда
-- ("Все города"), отдельного нового поля под город заводить не пришлось.
-- "Офис" в ТЗ упомянут как отдельный фильтр, но соответствующего поля нет
-- ни в одной форме проекта и явно просили добавить только "Отдел" — фильтр
-- по офису НЕ реализован (см. финальный отчёт, "что осталось").
CREATE TABLE IF NOT EXISTS responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id       UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  respondent_id  UUID NOT NULL DEFAULT gen_random_uuid(),
  department     TEXT,
  region         TEXT NOT NULL,
  age            SMALLINT NOT NULL,
  gender         CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  activity_key   TEXT NOT NULL,
  measurements   JSONB NOT NULL,
  results        JSONB NOT NULL,
  inwell_score   SMALLINT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_responses_audit_id ON responses (audit_id);

-- Живой статус аудита — единственный источник правды, используется и в
-- дашборде, и (отдельно, под блокировкой строки) при приёме ответа.
CREATE OR REPLACE FUNCTION audit_effective_status(p_deadline DATE, p_max_responses INT, p_response_count BIGINT)
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN p_deadline < CURRENT_DATE THEN 'expired'
    WHEN p_response_count >= p_max_responses THEN 'full'
    ELSE 'active'
  END;
$$;

-- ---------------------------------------------------------------------------
-- RLS. Экспресс-API подключается сервисной ролью (service role /
-- postgres), которая по умолчанию обходит RLS — это ожидаемо: бизнес-логика
-- (лимиты, дедлайны, генерация токена, атомарность через FOR UPDATE)
-- реализована в коде routes/corporate.ts, а не в политиках. RLS здесь —
-- вторая линия защиты НА СЛУЧАЙ прямого обращения к Postgres через
-- Supabase-клиент (anon/authenticated роль), чтобы БД сама не отдала чужие
-- данные, даже если фронтенд что-то напутает.
-- ---------------------------------------------------------------------------
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companies_select_own ON companies;
CREATE POLICY companies_select_own ON companies
  FOR SELECT
  USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS audits_select_own ON audits;
CREATE POLICY audits_select_own ON audits
  FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE auth_user_id = auth.uid()));

-- Намеренно НЕТ политик INSERT/UPDATE/DELETE для companies и audits под
-- ролью authenticated — создание компаний только админ-скриптом (service
-- role), создание/чтение audits с бизнес-правилами — только через Express
-- (service role). Компании не могут редактировать/удалять аудиты (по ТЗ).
--
-- Намеренно НЕТ ни одной политики на responses для authenticated/anon —
-- значит ни один Supabase-клиент (даже залогиненная компания) не может
-- прочитать ни одной строки responses напрямую, вообще никак, ни один
-- столбец. Это и есть техническая гарантия того, что respondent_id,
-- измерения и персональный отчёт сотрудника не утекут компании иначе, чем
-- через явно написанный, дающий только агрегаты, код в routes/corporate.ts.
