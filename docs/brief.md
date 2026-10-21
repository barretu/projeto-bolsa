# Product Brief — Daily Routine App

Outcome of the grilling session (2026-10-21). Source for every OpenSpec change proposal.

## Product
- Responsive web app, multi-user, portfolio piece.
- UI in pt-BR and English. First visit follows the browser (Portuguese → pt-BR, anything else → en); a header switcher overrides it, stored in a cookie.
- README in English.

## Accounts
- Open sign-up with email + password (min 8 chars). No email verification, no password reset.
- Password hashed with argon2; session = JWT in an `httpOnly` cookie, valid 7 days. Logout button.
- Users only see their own data; another user's id returns **404**.
- API returns error codes (e.g. `EMAIL_TAKEN`); the frontend translates them.

## Task
- Title (required, max 200 chars), date (plain day, e.g. `2026-10-21`; "today" comes from the browser), done/pending, optional plan (0 or 1).
- Edit title, date and plan. Delete asks for confirmation.
- Within a day: pending first, done below (struck through).
- Toggling done waits for the server (no optimistic update).

## Plan
- Title (required, max 200 chars), **no date** — its tasks keep their own dates.
- Progress ("3/5") is derived; a plan is done when all its tasks are done. May be empty.
- Deleting a plan deletes its tasks, after confirmation.

## Screens
- `/login`, `/cadastro`; logged-out users are redirected to `/login`.
- `/` Today: ← → day navigation, quick add (type + Enter creates on the day shown, no plan), **Overdue** section (pending tasks from earlier days), plan name badge.
- `/planos`: list with progress, "New plan", delete.
- `/planos/[id]`: tasks grouped by date, add task, rename plan.
- Header: language switcher, user email, logout. No settings page.
- Loading: skeleton. Errors: toast.

## Technical
- Next.js + shadcn/ui + next-intl (cookie, no URL prefix) · FastAPI · PostgreSQL.
- Docker for local development only. Production: Vercel (Next.js + FastAPI under `/api`) + Neon Postgres.
- Tests: pytest on the backend, with focus on user isolation. No frontend tests in v1.

## Build order (one OpenSpec change each)
1. Tasks + Today screen (local, no login, i18n from day one)
2. Plans
3. Accounts (`add-auth`, with migration; pre-auth data may be discarded)
4. Deploy (Vercel + Neon)

## Out of v1 (future changes)
Recurring tasks/habits, tags, priority, notes, time of day, reminders, stats, drag-to-reorder, password reset, demo account, language stored on the account, frontend tests.
