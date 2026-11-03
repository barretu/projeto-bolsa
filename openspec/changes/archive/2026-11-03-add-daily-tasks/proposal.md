# Proposal

## Why

The project is empty. The core of a daily routine app is seeing and managing what you have to do on a given day, so this is the first slice: tasks and the Today screen, running locally, bilingual from day one so later screens never need retrofitting.

## What Changes

- Create the monorepo skeleton: `web/` (Next.js + shadcn/ui + next-intl), `api/` (FastAPI), and a `docker-compose.yml` with only a Postgres `db` service.
- Tasks: create (title + date), list by day, list overdue (pending, earlier than today), toggle done, edit title and date, delete with confirmation.
- Today screen at `/`: ← → day navigation, quick add (type + Enter creates on the day shown), pending first then done (struck through), Overdue section, skeleton while loading, toast on error.
- Language: pt-BR and en; first visit follows the browser, a header switcher overrides it and is stored in a cookie. Dates formatted per language.
- API returns error codes, never user-facing text.
- Backend tests with pytest.

Out of scope (later changes): plans, accounts/auth, deploy, containerizing web and api.

## Capabilities

### New Capabilities
- `tasks`: dated to-do items and how they are listed, completed, edited and deleted — including the day view and the overdue list.
- `localization`: which language the UI is shown in and how the user switches it.

### Modified Capabilities
<!-- none: no existing specs -->

## Impact

- New code: `web/`, `api/`, `docker-compose.yml`, root `.gitignore`.
- New HTTP API under `/api/tasks`.
- New dependencies: Next.js, shadcn/ui (Tailwind), next-intl; FastAPI, SQLAlchemy, Alembic, psycopg, pytest.
- Local tooling the developer must install: Docker (for Postgres), uv (Python package manager).
