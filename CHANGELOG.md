# Changelog

All notable changes to this project are documented here. Entries are grouped by
the date they landed on `main` (this project deploys straight from `main`, see
README — there are no release tags yet).

Format loosely follows [Keep a Changelog](https://keepachangelog.com/), scoped
down for a small solo-founder-speed project: what changed and why, not a
strict `Added`/`Changed`/`Fixed` taxonomy for every line.

## Unreleased

- **Shared types package.** `TestType`/`TestKey` used to be hand-duplicated in
  three places (`apps/api/src/calc/questionnaire/types.ts`,
  `apps/web/src/corporate/types.ts`, `apps/web/src/audit/types.ts`). They now
  live once in a new `packages/shared` npm workspace package, imported by
  both apps. The repo is now an npm workspace at the root (`package.json`
  with `workspaces: [apps/api, apps/web, packages/shared]`) — see the
  updated *Run manually* section in `README.md` for the new install step.
  Both Dockerfiles and `docker-compose.yml`'s build contexts were updated to
  build from the repo root instead of each app's own directory, since Docker
  can only `COPY` files inside its build context and `packages/shared` lives
  outside both app directories.
- **Route-based code splitting on the frontend**, cutting the previous
  932 KB single-bundle first load.
- **`useFitnessReportData` hook** extracted from `ReportView.tsx`'s data
  derivation, separating it from rendering.
- **React error boundaries** around report rendering, so a malformed report
  object shows a fallback instead of a white screen.
- **`/corporate` marketing page's "5 modules" section fixed** — it previously
  advertised five modules (Physical Fitness / Mental Wellbeing / Job
  Satisfaction & eNPS / Nutrition & Habits / Sleep & Recovery) that didn't
  match any of the actually selectable audit test types. It now lists the
  real six (fitness + the five questionnaire tests below), reusing the same
  names/descriptions as `t.tests.*` in the frontend i18n files so the two
  can't drift independently again.
- **`vitest` unit tests** added for the pure scoring/aggregation functions:
  `computeQuestionnaireReport` (all 5 questionnaire test types),
  `buildLoyaltyMetric`/`buildQuestionnaireGroupAggregate` in
  `corporateAggregation.ts`, and the fitness `bandFromScore`/`inwellScore`
  helpers. This was the single biggest testing gap flagged in the code
  review (section 2) — before this, only the fitness formulas had any
  automated coverage at all.
- **Post-deploy smoke test script** (`scripts/smoke-test.sh`) — hits the
  public API after a deploy and fails loudly on a non-200, catching the
  class of bug that caused the nginx/env outage below before a person has to
  notice it manually.
- **`docker-compose.yml` healthchecks** added for both services.

## 2026-08-26

- **5 selectable corporate test types alongside fitness.** Companies can now
  create an audit for one of loyalty (eNPS-style), burnout, turnover risk,
  wellbeing, or psychological safety, in addition to the original physical
  fitness assessment — one link, one test type per audit, 15-response
  minimum before aggregated results are shown. New `audits.test_type`
  column, a generic questionnaire scoring engine
  (`apps/api/src/calc/questionnaire/`) alongside the untouched fitness
  `computeFullReport()` path, a shared simplified report template on the
  frontend, and Russian/Uzbek copy for all 5 tests. `/personal` navigation
  was hidden from the header (routes themselves untouched).
- **Fixed Docker build missing Supabase env vars for the web image** — the
  web container's `/login` page was silently showing "Supabase ещё не
  настроен" because the Vite build-time Supabase env vars weren't being
  passed through as Docker build args.

## 2026-08-20

- Stopped hardcoding `localhost` in deploy config — made the compose stack
  domain-agnostic so the same commands work under `inwell.uz`, a bare server
  IP, or any other domain. This is also what exposed the dual-nginx-layer
  fragility described in the code review (section 4): the host-level nginx's
  `proxy_pass` target wasn't updated to match the Docker-side port change,
  causing `/api/` to 502 until it was noticed manually — there was no
  monitoring or smoke test to catch it automatically, which is why one was
  added above.
- Rebuilt the B2B (`/corporate`) marketing page and unified it with the B2C
  design on a matching bento layout.
- Fixed micro-text truncation on `/corporate` (step labels, module titles in
  the employee mockup).
- Conversion pass on `/corporate`: curiosity hook, richer dashboard mockups,
  unified CTA.

## 2026-08-18

- Added `/example` demo report, a personal-page CTA revamp, and save-as-PNG
  for reports.
- Rewrote `README.md` in English for external/investor readability; removed
  internal dev-notes files.
- **Initial commit** — Inwell personal + corporate MVP on Supabase Postgres.
