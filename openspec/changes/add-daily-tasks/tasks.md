# Tasks

## 1. Local tooling and database

- [x] 1.1 Install Docker Engine + Compose plugin and uv on the host; verify `docker run --rm hello-world` and `uv --version` succeed
- [x] 1.2 Add root `.gitignore` (node_modules, .next, .venv, __pycache__, .env) and verify `git status` does not list ignored paths
- [x] 1.3 Add `docker-compose.yml` with a `db` Postgres service (port 5432, named volume) and an init script that creates `app_test`; verify `docker compose up -d db` and `docker compose exec db psql -U app -l` lists `app` and `app_test`

## 2. Backend: project and data model

- [x] 2.1 Create `api/` with `uv init` and add fastapi, uvicorn, sqlalchemy, psycopg, alembic, pytest, httpx; verify `uv run python -c "import fastapi"` succeeds
- [x] 2.2 Add the FastAPI app with `GET /api/health`; verify `uv run uvicorn app.main:app --reload` serves `{"status":"ok"}` and `/docs` opens
- [x] 2.3 Add the database session (`DATABASE_URL` with local default) and the `Task` model; verify the app starts with Postgres running
- [x] 2.4 Set up Alembic and the first migration creating `tasks`; verify `uv run alembic upgrade head` creates the table (`\d tasks` in psql)
- [x] 2.5 Add pytest fixtures (TestClient, `app_test` database, truncate between tests); verify `uv run pytest` passes a health test

## 3. Backend: task endpoints

- [x] 3.1 Implement `POST /api/tasks` with title rules and error codes; verify tests for valid task, `TITLE_REQUIRED` and `TITLE_TOO_LONG` pass
- [x] 3.2 Implement `GET /api/tasks?date=` with pending-first ordering; verify tests for "mixed day is ordered" and "other days are not shown" pass
- [x] 3.3 Implement `GET /api/tasks/overdue?before=`; verify tests for pending vs done tasks from yesterday pass
- [x] 3.4 Implement `PATCH /api/tasks/{id}` (title, date, done) and `DELETE /api/tasks/{id}`; verify tests for toggle, reschedule, delete and `TASK_NOT_FOUND` pass
- [x] 3.5 Map request validation failures to `VALIDATION_ERROR`; verify a test with an invalid date returns 422 with that code

## 4. Frontend: project, UI kit and languages

- [ ] 4.1 Create `web/` with `create-next-app` (TypeScript, Tailwind, App Router) and add the `/api` dev rewrite; verify `npm run dev` serves the page and `/api/health` returns ok through Next
- [ ] 4.2 Run `shadcn init` and add button, input, checkbox, dialog, alert-dialog, skeleton, sonner; verify components exist under `web/components/ui/` and `npm run build` passes
- [ ] 4.3 Set up next-intl without routing (cookie, then Accept-Language), `messages/pt-BR.json` and `messages/en.json`, and the header language switcher; verify a pt browser sees pt-BR, an es browser sees en, and the switch survives a reload

## 5. Frontend: Today screen

- [ ] 5.1 Add browser-local date helpers (today, ±1 day, format per locale) with a small self-check; verify the self-check passes and "today" after 21:00 BRT is still today
- [ ] 5.2 Build the day view: heading with localized date, ← → navigation, list pending first, done struck through, skeleton while loading, error toast; verify in the browser against the running API
- [ ] 5.3 Add quick add (Enter creates on the day shown, field clears) and show API error codes as translated messages; verify by adding a task on a future day and a 201-character title
- [ ] 5.4 Add toggle done (waits for server), edit dialog (title + native date input) and delete with AlertDialog confirmation; verify each, including cancel on delete and a reschedule leaving the current day
- [ ] 5.5 Add the Overdue section (only on today, hidden when empty); verify with a pending and a done task dated yesterday

## 6. Integration check

- [ ] 6.1 With db, api and web running, walk every scenario in `specs/tasks` and `specs/localization` in both languages; verify `uv run pytest` and `npm run build` both pass and `openspec validate add-daily-tasks --strict` is valid

## Workflow follow-up

- Archive the change with `/opsx:archive` after review.
