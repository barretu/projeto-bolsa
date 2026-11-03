# Design

## Context

Greenfield repo: only `openspec/` and `docs/brief.md` exist. Host has Node 24 / npm 11 and Python 3.12; Docker and uv are not installed yet. Later changes add plans, auth (with a migration) and a Vercel deploy where FastAPI lives under `/api` on the same domain as Next.js — this design keeps that shape from the start.

## Goals / Non-Goals

**Goals:**
- Same-origin `/api` in development, exactly like production, so no CORS and the future auth cookie just works.
- Database schema managed by migrations from day one, because change 3 must migrate existing tables.
- The server never decides what "today" is; the browser sends dates.

**Non-Goals:**
- Containerizing `web/` and `api/` (only Postgres runs in Docker here).
- Optimistic UI, client-side caching libraries, frontend tests.

## Decisions

### Repo layout
```
docker-compose.yml   # service: db (Postgres)
api/                 # FastAPI app, managed by uv
web/                 # Next.js app, managed by npm
```
Alternative: separate repos — rejected; one repo is simpler to review and to show in a portfolio.

### HTTP API
| Method | Path | Body / query | Result |
|---|---|---|---|
| GET | `/api/tasks` | `?date=YYYY-MM-DD` | tasks of that day, ordered `done`, `created_at`, `id` |
| GET | `/api/tasks/overdue` | `?before=YYYY-MM-DD` | pending tasks with `date < before`, ordered `date`, `created_at` |
| POST | `/api/tasks` | `{title, date}` | 201 + task |
| PATCH | `/api/tasks/{id}` | any of `{title, date, done}` | 200 + task |
| DELETE | `/api/tasks/{id}` | — | 204 |

`before` is the browser's today, so overdue is correct in any time zone. One `PATCH` covers toggle and edit — alternative was a separate `/toggle` endpoint, rejected as redundant.

### Errors
Errors are `{"detail": "<CODE>"}`. Title rules are checked in the endpoint (`TITLE_REQUIRED`, `TITLE_TOO_LONG`, status 422); missing task → 404 `TASK_NOT_FOUND`; any other request validation failure is mapped by one exception handler to 422 `VALIDATION_ERROR`. Alternative: Pydantic validators — rejected because FastAPI wraps their messages in a list of dicts, not a stable code.

### Backend stack
- **uv** for the Python project and dependencies (one tool for venv + lockfile).
- **SQLAlchemy 2 (sync)** + **psycopg 3** + **Alembic**. Sync endpoints run in FastAPI's thread pool; async adds complexity with no benefit at this scale.
- Config: `DATABASE_URL` env var with a local default. No settings library.
- Table `tasks`: `id` (int PK), `title` (varchar 200), `date` (date, indexed), `done` (bool, default false), `created_at` (timestamptz, default now).

### Tests
pytest + FastAPI `TestClient` against a real Postgres database `app_test` (created by an init script in the `db` container). Tables are created from the models and truncated between tests. Alternative: SQLite in memory — rejected; date and ordering behavior must match production Postgres.

### Frontend stack
- Next.js App Router + TypeScript + Tailwind (from `create-next-app`), shadcn/ui components: `button`, `input`, `checkbox`, `dialog`, `alert-dialog`, `skeleton`, `sonner`.
- `next.config` rewrites `/api/:path*` → `http://localhost:8000/api/:path*` in development.
- Today screen is a client component using plain `fetch`; no data-fetching library.
- Date editing uses the native `<input type="date">` (shadcn `Input`), not a calendar popover.

### Localization
next-intl **without i18n routing**: `i18n/request.ts` picks the locale from the `NEXT_LOCALE` cookie, else from `Accept-Language` (`pt*` → `pt-BR`, anything else → `en`). Messages in `web/messages/pt-BR.json` and `web/messages/en.json`; API error codes are keys under `errors`. The switcher writes the cookie and calls `router.refresh()`.

### Dates in the browser
"Today" is built from local `getFullYear/getMonth/getDate`, never `toISOString()` (that is UTC and gives tomorrow's date in Brazil after 21:00). `YYYY-MM-DD` strings are parsed as local dates before formatting.

## Risks / Trade-offs

- [Docker not installed yet] → install before applying; tasks start with it.
- [Port 5432 or 8000 already in use] → ports are set in one place each (`docker-compose.yml`, the uvicorn command).
- [Rewrites only exist in dev] → production routing to FastAPI is solved in the deploy change.
- [Truncating tables between tests is slower than transactions] → fine for this test suite size.

## Migration Plan

New project, nothing to migrate. Rollback = revert the commits. The first Alembic migration creates `tasks`.
