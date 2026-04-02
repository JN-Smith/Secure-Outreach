# Secure Outreach

Secure Outreach is a role-based outreach tracking system with a FastAPI backend and a React (Vite) frontend.

- **Backend:** FastAPI + SQLAlchemy (Advanced Alchemy), async DB access
- **Frontend:** React + TypeScript + Tailwind, `wouter` routing, React Query
- **Auth:** JWT access tokens + HttpOnly refresh cookie



## Repo structure

- `api/` — FastAPI API server
- `client/` — React web client
- `Frontend Design/` — HTML design references (not part of the runtime app)

## Prerequisites

Backend:
- Python 3.12+
- `uv` (recommended) or another way to install the Python deps

Frontend:
- Node.js 18+ (or newer)
- npm (or pnpm/yarn)

## Quickstart (local dev)

### 1) Backend (API)

From the `api/` folder:

1. Configure environment:
   - Copy `api/.env.example` to `api/.env` (or edit the existing `.env`)
   - For dev, SQLite works out of the box with:
     - `DATABASE_URL=sqlite+aiosqlite:///./dev.db`

2. Run the API:

- `cd api`
- `uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000`

On first startup with SQLite and an empty DB, the API will auto-seed demo data.

API base URL:
- `http://127.0.0.1:8000`

### 2) Frontend (client)

From the `client/` folder:

- `cd client`
- `npm install`
- `npm run dev`

Frontend URL:
- `http://127.0.0.1:3000`

The Vite dev server proxies `/api/*` to `http://127.0.0.1:8000` (see `client/vite.config.ts`), so the client can call the backend without extra CORS setup during local development.

## Environment configuration (API)

The backend loads configuration from `api/.env` (via an absolute path in `api/src/config.py`).

Common variables:

- `DATABASE_URL`
  - Dev SQLite example: `sqlite+aiosqlite:///./dev.db`
  - If unset, the API builds a Postgres URL from `POSTGRES_*`

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_PORT`
  - Used when `DATABASE_URL` is not provided

- `JWT_SECRET`
  - Required; set a strong value in production

- `CORS_ORIGINS`
  - Comma-separated allowlist, e.g. `http://localhost:3000,http://example.com`

- `SEED_PASTOR_NAME`, `SEED_PASTOR_EMAIL`, `SEED_PASTOR_PASSWORD`
  - Optional
  - Used only if there are no users yet and you are NOT running with SQLite dev seeding

## Auth model (how login works)

- Client logs in via `POST /api/auth/login`
  - Receives an **access token** (JWT) and stores it in `localStorage`
  - Receives a **refresh token** cookie (`refresh_token`, HttpOnly)

- Client API requests include:
  - `Authorization: Bearer <access_token>`
  - `credentials: "include"` so the refresh cookie is sent

- When an API request returns 401, the client calls `POST /api/auth/refresh` once and retries.

## Scripts

Frontend (`client/package.json`):
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

Backend (recommended):
- `uv run uvicorn main:app --reload`

## Docker / Compose

`api/compose.yaml` defines a Postgres service plus an `app` service.

Note: the compose file references a `Dockerfile` in `api/`, but this repository currently does not include one. If you want Docker-based deployment, add that Dockerfile (or adjust the compose to run the API another way).

## Where to look next

- Backend routes: `api/src/db/routes/`
- Backend services: `api/src/services/`
- Frontend API hooks: `client/src/lib/api/`
- Frontend pages: `client/src/pages/`

For feature/product overview (roles, MVP notes), see [client/README.md](client/README.md).
