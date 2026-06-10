# EV Dashboard

A full-stack Electric Vehicle dashboard app — visualizes battery, range, and temperature metrics for cars stored in a PostgreSQL database.

## Run & Operate

- `pnpm --filter @workspace/ev-dashboard run dev` — run the frontend (port 5000)
- `PORT=3001 pnpm --filter @workspace/api-server run dev` — run the API server (port 3001)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7 + Tailwind CSS v4 + Radix UI + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ev-dashboard/` — React/Vite frontend (SPA)
- `artifacts/api-server/` — Express API server
- `lib/db/src/schema/` — Drizzle ORM schema (source of truth for DB)
- `lib/api-spec/` — OpenAPI YAML spec (source of truth for API contract)
- `lib/api-zod/` — generated Zod schemas from OpenAPI spec
- `lib/api-client-react/` — generated TanStack Query hooks from OpenAPI spec

## Architecture decisions

- Frontend runs on port 5000 (Replit webview), API server runs on port 3001 in dev
- Vite dev server configured with `host: "0.0.0.0"` and `allowedHosts: true` for Replit proxy compatibility
- API client uses mock mode by default (`ApiContext`) — no backend required for frontend-only development
- Static deployment target for the frontend; API server deployed separately if needed

## Product

Users can monitor EV fleet metrics including battery level, range, and temperature through an interactive dashboard with charts and maps.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `base` path in `vite.config.ts` was originally set to `/hci_project/` for GitHub Pages — removed for Replit
- API server requires `PORT` env var to be explicitly set; defaults to 3001 in dev
- Run `pnpm --filter @workspace/db run push` after any schema changes before starting the API server

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
