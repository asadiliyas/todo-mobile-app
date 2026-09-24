# To-Do List — Mobile App

A task manager built from a Figma mobile design, for the DigiAccel SDE‑1 (MERN stack) take-home assignment. Create, edit, complete and search tasks; tasks are organised into Monday–Sunday weeks with an open/completed summary per week.

**Live demo:** [todo-mobile-app-alpha.vercel.app](https://todo-mobile-app-alpha.vercel.app) · **Figma:** [To-Do List Mobile app](https://www.figma.com/design/mz2PJoTwa5DxYrdrFPem3f/To-Do-List-Mobile-app?node-id=0-1)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript, React 19 |
| Styling | Tailwind CSS v4 |
| API | Next.js Route Handlers under `/api/tasks` (this is the "own API") |
| Database | MongoDB + Mongoose |
| Validation | Zod — one schema shared by the form and the API |
| Data fetching | TanStack Query, with optimistic updates |
| Forms | react-hook-form |
| Animation | `motion` (bottom sheet, swipe-to-delete, expanding cards) |
| Tests | Vitest (unit) |
| Deployment | Vercel |

## Features

- **Task CRUD** — title (required), description (optional), date & start/end time (required), priority low/medium/high (optional).
- **Search** — keyword search across title and description, with view/edit/delete on each result.
- **Weekly organisation** — weeks run Monday–Sunday; a "Weekly overview" card per week shows open vs. completed counts and expands into that week's tasks grouped by day.
- **Status** — mark a task Completed or In Progress; the checkbox and the weekly counts stay in sync.
- **Delete** — swipe a task left to reveal Delete (as in the brief's flow), or use the always-visible delete icon; either way you get an **Undo**.
- **Sample data** — a "Load sample tasks" button on the empty state seeds a realistic set of tasks around today, for a quick look without typing anything in.
- **Responsive** — a single-column layout on mobile (built to the Figma's 390px frame, works down to 320px) and a two-column dashboard layout on tablet/desktop.
- **No login required** — each browser gets its own private task list via an anonymous cookie (see [Privacy model](#privacy-model--api)). Nothing to sign up for, and visitors never see each other's tasks.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **No environment variables are required to run this locally** — see [Database](#database) below.

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / run it |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests |

## Database

Set a `MONGODB_URI` environment variable (see [.env.example](.env.example)) to point at a real MongoDB database in production.

**Locally, you can skip this entirely.** If `MONGODB_URI` isn't set, [src/lib/db.ts](src/lib/db.ts) automatically starts a temporary in-memory MongoDB (via `mongodb-memory-server`, a dev-only dependency) so the app runs with zero setup. Data doesn't persist across restarts in that mode — set `MONGODB_URI` for real persistence.

## API reference

All routes live under `/api/tasks` and return `{ data }` on success or `{ error: { message, code, fieldErrors? } }` on failure.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/tasks?from=&to=` | Tasks with `startAt` in `[from, to]` (ISO instants) |
| `GET` | `/api/tasks?q=` | Case-insensitive search across title/description |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks/:id` | Read one task |
| `PATCH` | `/api/tasks/:id` | Update any field, including `status` |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/tasks/weeks` | Open/completed counts per week — see below |
| `POST` | `/api/tasks/sample` | Seed demo tasks around today |

`GET /api/tasks/weeks` and `POST /api/tasks/sample` need a `tzOffsetMinutes` value (`new Date().getTimezoneOffset()` from the browser) so week boundaries land on the *visitor's* Monday, not the server's — see [src/lib/server-week.ts](src/lib/server-week.ts).

## Privacy model & API

The brief doesn't ask for user accounts, but a single shared task list on a public demo would mean visitors could see and delete each other's tasks. Instead, [proxy.ts](src/proxy.ts) (Next's request-middleware convention) gives every browser a random id in a long-lived, `httpOnly` cookie on first visit. Every API route reads that cookie server-side — never a value the client could forge through the request body — and scopes every read/write to it. No signup, no password, and visitors never see each other's data.

## Design decisions (Figma vs. the brief)

A few places where the Figma and the written brief disagreed, or the brief asked for something the Figma doesn't show:

1. **Week start.** The Figma's day strip runs Sun–Sun; the brief explicitly says weeks run Monday–Sunday. Went with Monday–Sunday.
2. **Priority.** Not in the Figma; the brief asks for it. Added a Low/Medium/High segmented control styled to match the rest of the form.
3. **Weekly overview.** The Figma only shows the current week's stats. The brief asks for a card per week that expands to show that week's tasks — added as its own section, styled like the existing stat cards.
4. **Task rows.** The Figma shows only a title; since tasks have a date and time, added a small time line under each title.
5. **Status.** The checkbox toggles between the brief's two states, Completed and In Progress ("open" = in progress).
6. **Settings/notification icons** shown on the Figma's "New Task" frame aren't referenced anywhere in the brief, so they were left out.

## Testing

```bash
npm run test
```

Unit tests cover the parts most worth pinning down with real assertions rather than eyeballing: Monday–Sunday week math ([week.test.ts](src/test/week.test.ts)), the timezone-safe server-side week boundaries ([server-week.test.ts](src/test/server-week.test.ts)), and the Zod validation rules shared by the form and the API ([validation.test.ts](src/test/validation.test.ts)).

`.github/workflows/ci.yml` runs lint, typecheck, tests and a production build on every push.

## Project structure

```
src/
  app/                  Pages (Home, Search, Welcome/onboarding) + API routes
  components/           UI (task form, task row, week strip, bottom sheet, ...)
  hooks/                React Query hooks + mutations
  lib/                  Validation, DB connection, week math, API client
  models/               Mongoose schema
  test/                 Vitest unit tests
```

## Deployment

Deployed on Vercel, connected to this repository — every push to `main` deploys automatically.
