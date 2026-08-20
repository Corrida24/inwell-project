# Inwell

Inwell is a biometric wellness platform with two products on a single codebase:

- **Personal** (`/personal`) — a free, self-service body-composition check-up. Users enter measurements taken with a tape measure and a scale and get an instant report: BMI, waist-to-height and waist-to-hip ratios, body-fat estimate, visceral fat area, and several other indices, each benchmarked against a reference population and against Inwell's own accumulated data.
- **Corporate** (`/corporate`) — a B2B wellness-audit product. A company gets a login, creates an audit, and shares one public link with employees. Each employee completes the same measurement form anonymously (no name, phone, or email) and receives their own personal report, while the company sees an aggregated, anonymized dashboard across the whole workforce — participation, score distribution, and breakdowns by department, gender, age band, and city.

All health calculations run once, on the backend, and are shared by both products — the corporate dashboard is aggregation on top of the same report engine used by `/personal`, not a separate calculator.

## Tech stack

- **Frontend** (`apps/web`) — React 19, Vite, Tailwind CSS, React Router. Single-page app serving both the personal and corporate experiences.
- **Backend** (`apps/api`) — Node.js, Express, TypeScript, PostgreSQL. All formulas, validation, and aggregation logic live here.
- **Database** — Supabase-hosted PostgreSQL, the single database for the whole application (no local/fallback database).
- **Auth** — Supabase Auth (email + password) for company accounts.

```
apps/
  web/   React app — personal landing/report + corporate login/dashboard/results
  api/   Express API — calculations, persistence, aggregation, auth
    src/db/migrations/   Versioned, idempotent SQL migrations, applied in order at API startup
docker-compose.yml        Runs the application only (api + web); the database is always Supabase
```

## Product features

### Personal report

- Body-composition report computed from manual measurements: height, weight, waist, hip, chest, neck, thigh and biceps circumference, age, gender, and activity level.
- Indices: BMI, waist-to-height ratio, waist-to-hip ratio, Body Adiposity Index, Body Roundness Index, A Body Shape Index, Conicity Index, Abdominal Volume Index, estimated visceral fat area, US Navy body-fat percentage, body surface area, basal metabolic rate, and total daily energy expenditure — combined into a single weighted **Inwell Score**.
- Each metric is benchmarked two ways: against a normal-distribution reference population, and against Inwell's own accumulated measurements for the same gender (once enough data exists).
- An optional phone number lets a user track progress over time — a repeat submission from the same number links to the previous one and unlocks a "your progress" comparison (weight, waist, BMI, etc.). Without a phone number, the report is still generated and the measurement is still recorded (each submission gets its own unique, anonymous record — see *Data & privacy* below); it just cannot be looked up again for a future comparison.
- Interface available in Russian and Uzbek.

### Corporate wellness audits

- **Company access** — companies do not self-register; an administrator provisions each company's login. The login page surfaces contact details for requesting access.
- **Dashboard** — company name, tax ID, and a list of the company's audits (up to 10 per company).
- **Create an audit** — name, deadline, and a response cap (1–100; larger headcounts are routed to a custom-pricing conversation). Creating an audit generates a unique, unguessable public link that can be copied from the audit list at any time.
- **Employee form** — reached via the public link, no login required. Employees provide only what the calculation needs, plus a department, and see their own personal report immediately after submitting.
- **Results dashboard** — desktop-first, aggregate view of the whole audit: overall participation and average score, notable strengths and areas of attention, participant composition (gender/age/department/city), a summary metrics table with category breakdowns, and per-department, per-gender, and per-age-band comparisons. Filters for city, office, gender, age band, and department.

### Public "people analyzed" counter

The personal landing page shows a running total of completed analyses (personal and corporate combined), served by a small public endpoint that sums both tables. No individual data is exposed — just the count.

## Data & privacy

- Corporate responses never include a name, phone number, or email — only the measurements the calculation needs plus an optional department. There is no field that could identify a respondent.
- At the database level, the `responses` table has no row-level-security read policy for any client role (`anon` or `authenticated`) — it can only be read by the backend's service role. A company can never query employee-level data directly, even if it wanted to; the API only ever returns aggregates.
- Every API request for a company's audits and results is additionally scoped to that company's ID in application code, independent of the database-level protection — access control does not rely on a single layer.
- Personal submissions are recorded regardless of whether a phone number is provided; without one, a submission is stored as a standalone anonymous record that cannot be re-associated with the person who submitted it.

## Getting started

You'll need a Supabase project (PostgreSQL + Auth). Copy `apps/api/.env.example` to `apps/api/.env` and `apps/web/.env.example` to `apps/web/.env`, and fill in your Supabase project's connection string and API keys.

Use your Supabase project's **Session pooler** connection string for `DATABASE_URL`, not the direct connection — the direct hostname is IPv6-only and unreachable from many networks and container runtimes, and the application needs standard multi-statement transactions with row locking, which the transaction pooler does not support.

Never put the Supabase service-role key or the database connection string in the frontend build — only the publishable/anon key belongs there.

### Run with Docker

```bash
docker compose up --build
```

Web: http://localhost:8080 — API: http://localhost:4000. Database migrations are applied automatically on API startup.

### Run manually

```bash
# API
cd apps/api
npm install
npm run dev          # http://localhost:4000

# Web (separate terminal)
cd apps/web
npm install
npm run dev           # http://localhost:3000
```

Run the calculation engine's regression tests independently of the database with `npm test` inside `apps/api`.

### Provisioning a company account

```bash
cd apps/api
npm run create-company -- --name "Company LLC" --inn 123456789 \
  --email hr@company.com --password "StrongPassword123"
```

Creates a Supabase Auth user and the corresponding company record. Share the resulting credentials with the company directly.

### Demo data

`npm run seed-demo-company -- --count 50` (inside `apps/api`) generates a demo company with one audit and a realistic, varied set of anonymous responses, useful for reviewing the corporate dashboard without collecting real employee data. This script inserts directly into a local test database's `auth` schema and is not compatible with a live Supabase project — development/staging use only.

## Deployment

Any Linux VPS with Node.js works; PostgreSQL does not need to be self-hosted since the database is always Supabase.

- **Docker (recommended)** — populate `apps/api/.env` with production values, then `docker compose up -d --build`. No domain needs to be set anywhere in `docker-compose.yml`: the web container's nginx proxies `/api/*` to the api container over the internal docker network (see `apps/web/nginx.conf`), so the frontend always calls its own origin — same commands work under `inwell.uz`, a bare server IP, or any other domain without editing the compose file. Put a reverse proxy with HTTPS (Caddy, Nginx, etc.) on the host in front of port 8080 for `inwell.uz`; the api's port 4000 does not need to be exposed publicly. `WEB_ORIGIN` in `docker-compose.yml` (used only for the CORS header, not for routing) is already set to `https://inwell.uz`.
- **Without Docker** — `npm run build` in both `apps/api` and `apps/web`; serve `apps/web/dist` as static files, and run `apps/api` with a process manager (pm2, systemd). Since there's no nginx proxy in this path, set `VITE_API_BASE_URL` to the API's real public URL (e.g. `https://inwell.uz/api` if you put your own reverse-proxy rule in front of it, or `https://api.inwell.uz`) before running `npm run build` for the frontend — the frontend's environment variables (`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are baked into the static build at `vite build` time.

## Roadmap

- Phone/Telegram-based login and a personal account with full measurement history — the schema already has a `telegram_id` column reserved for this.
- Code-splitting the frontend bundle (currently a single ~830 KB chunk).
- A mobile layout for the corporate results dashboard (currently desktop-first by design; the personal product and marketing pages are already mobile-responsive).
- Switching age input to date of birth for exact age calculation (currently a direct age field, a deliberate simplification that does not affect percentile accuracy).
