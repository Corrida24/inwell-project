-- Inwell — схема БД (PostgreSQL)
--
-- users: один человек = один номер телефона (уникальный, нормализованный
-- формат +998XXXXXXXXX). Телефон в форме теперь необязателен — строка
-- пользователя создаётся, ТОЛЬКО если человек его указал (без телефона
-- сравнивать "через месяц" не с чем, поэтому и сохранять анонимно нечего).
-- Никаких ФИО не собираем — отчёт полностью анонимный, привязан только к
-- номеру телефона. telegram_id — задел на будущий Telegram-логин, пока NULL
-- для всех.
--
-- assessments: история замеров пользователя. Одна строка = одна отправка
-- формы. measurements/results хранятся как JSONB — гибко на случай, если
-- набор полей калькулятора изменится, но inwell_score вынесен в отдельную
-- колонку, потому что по нему считаются перцентили (нужен быстрый SELECT).
--
-- region — id одного из 13 вариантов (12 областей Узбекистана + отдельно
-- город Ташкент), список см. src/regions.ts. Хранится как id (не
-- локализованный текст), чтобы отчёт одинаково работал на ru/uz.

CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  phone         VARCHAR(16) NOT NULL UNIQUE, -- нормализованный формат: +998XXXXXXXXX
  email         TEXT,
  region        TEXT NOT NULL,
  gender        CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  telegram_id   BIGINT UNIQUE, -- задел на будущий Telegram-логин, пока не используется
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age             SMALLINT NOT NULL,
  activity_key    TEXT NOT NULL,
  measurements    JSONB NOT NULL,  -- {height, weight, waist, hip, chest, neck, bicepsR, bicepsL, thighR, thighL}
  results         JSONB NOT NULL,  -- полный FullReport (как отдан пользователю)
  inwell_score    SMALLINT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments (user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments (created_at);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users (gender);

-- Перцентиль Inwell Score считается по выборке (gender, последний замер на
-- пользователя) — вьюха ниже отдаёт по одному, самому свежему, замеру на
-- каждого пользователя, чтобы люди с несколькими отправками не перевешивали
-- статистику.
CREATE OR REPLACE VIEW latest_assessments AS
SELECT DISTINCT ON (a.user_id)
  a.id, a.user_id, u.gender, a.inwell_score, a.created_at
FROM assessments a
JOIN users u ON u.id = a.user_id
ORDER BY a.user_id, a.created_at DESC;
