#!/usr/bin/env bash
#
# Post-deploy smoke test -- hits the app through its PUBLIC domain (not
# localhost, not the container network) and fails loudly on anything but a
# healthy response.
#
# Why this exists: the code review (section 4) flagged that the production
# outage in this project's history was a mismatch between the containerized
# nginx's port and the host-level nginx's proxy_pass target -- `/api/`
# started 502ing, and it was discovered because someone tried to log in, not
# because anything paged anyone. This script is the "one-line post-deploy
# smoke test" recommended there: run it right after
# `docker compose up -d --build`, and a broken proxy chain (or a broken web
# build, or a database the api can't reach) shows up in the deploy's own
# exit code instead of waiting for a person to notice.
#
# This checks the PUBLIC request path end-to-end (through whatever reverse
# proxy/TLS termination sits in front, per the deploy docs in README.md),
# which is exactly the layer that broke last time -- hitting the api
# container directly (e.g. localhost:4000) would not have caught that.
#
# Usage:
#   ./scripts/smoke-test.sh [base-url]
#
#   base-url defaults to https://inwell.uz (this project's production
#   domain, see docker-compose.yml). Pass something else to check a
#   staging/IP/local deploy, e.g.:
#     ./scripts/smoke-test.sh http://127.0.0.1:8080
#
# Exit code: 0 if every check passes, 1 on the first failure (with the
# failing check, HTTP status, and a short body excerpt printed to stderr).
#
# Wire this into a real uptime monitor too (see README.md's deployment
# section) -- this script is for "did the deploy I just ran actually work",
# not for ongoing monitoring between deploys, which needs something that
# runs on its own schedule, not just after a human remembers to run this.

set -u

BASE_URL="${1:-https://inwell.uz}"
# Strip a trailing slash so "${BASE_URL}/api/health" doesn't double up.
BASE_URL="${BASE_URL%/}"

FAILED=0

# check <name> <path> <grep-pattern-for-body>
# Prints PASS/FAIL, and on failure sets FAILED=1 and prints the status code
# + a short body excerpt so a CI log or terminal shows enough to diagnose
# without re-running curl by hand.
check() {
  local name="$1" path="$2" expect_pattern="$3"
  local url="${BASE_URL}${path}"
  local response status body

  response="$(curl -sS -m 10 -w '\n__STATUS__:%{http_code}' "$url" 2>&1)"
  status="$(echo "$response" | grep -o '__STATUS__:[0-9]*$' | cut -d: -f2)"
  body="$(echo "$response" | sed 's/__STATUS__:[0-9]*$//')"

  if [ -z "$status" ]; then
    echo "FAIL  $name -- request to $url failed entirely (no HTTP response; network error or timeout)" >&2
    echo "      curl output: $body" >&2
    FAILED=1
    return
  fi

  if [ "$status" != "200" ]; then
    echo "FAIL  $name -- $url returned HTTP $status (expected 200)" >&2
    echo "      body: $(echo "$body" | head -c 300)" >&2
    FAILED=1
    return
  fi

  if [ -n "$expect_pattern" ] && ! echo "$body" | grep -Eq "$expect_pattern"; then
    echo "FAIL  $name -- $url returned 200 but body didn't match expected pattern ($expect_pattern)" >&2
    echo "      body: $(echo "$body" | head -c 300)" >&2
    FAILED=1
    return
  fi

  echo "PASS  $name ($url)"
}

echo "Smoke-testing $BASE_URL ..."
echo

# 1. Frontend is served at all (catches a broken web build or a web
#    container that isn't up).
check "frontend root" "/" "<"

# 2. API is reachable THROUGH the public proxy chain (catches exactly the
#    nginx-port-mismatch class of bug that caused the real outage -- see
#    header comment above). Doesn't touch the database.
check "api health" "/api/health" '"ok"[[:space:]]*:[[:space:]]*true'

# 3. API can actually reach the database (catches a misconfigured
#    DATABASE_URL / Supabase outage / the .env quoting trap described in
#    README.md and the code review, section 4 -- health above would NOT
#    catch this, since it only checks that Supabase env vars are set, not
#    that a query actually succeeds).
check "api database connectivity" "/api/stats/total-count" '"total"[[:space:]]*:[[:space:]]*[0-9]'

echo
if [ "$FAILED" -ne 0 ]; then
  echo "SMOKE TEST FAILED -- see above. Do not consider this deploy healthy." >&2
  exit 1
fi

echo "All smoke checks passed."
exit 0
