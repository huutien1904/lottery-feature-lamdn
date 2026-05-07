---
name: lottery-saas
description: >-
  Implements and maintains the Lottery SaaS monorepo using Next.js apps/web
  (shadcn/ui, TanStack Query + central apiFetch, Zustand, React Hook Form,
  Framer Motion, react-icons), NestJS apps/api, PostgreSQL, npm workspaces,
  Husky with path-scoped lint-staged (web vs api). Use when editing this
  repository, adding SaaS features (auth, tenants, subscriptions, trial 14 days
  max 15 participants no avatar uploads, Pro uploads and large imports),
  migrating legacy product/ code, or configuring tooling and deploy.
---

# Lottery SaaS Project Skill

## Stack and layout

- Frontend: `apps/web` (Next.js, App Router).
- Backend: `apps/api` (NestJS).
- Shared types/constants: `packages/shared` (minimal; expand as needed).
- Legacy webpack app: `product/` and `server/` — treat as reference or migration source; prefer new work in `apps/*` unless the task is explicitly to patch legacy.

## Before changing code

1. Match existing patterns in the target app (`apps/web` vs `apps/api`).
2. Run lint for the app you touched: `npm run lint:web` and/or `npm run lint:api` from repo root.
3. Husky `pre-commit` runs `lint-staged` only for staged files under `apps/web` or `apps/api` (scoped per folder).

## Product rules (enforce in design and API)

- **Trial**: 14 days; max **15** participants per event; **no** participant avatar upload.
- **Pro**: large participant lists (e.g. 1000+), avatar upload via presigned URLs to object storage; enforce on **backend** — UI hiding is not enough.
- **Multi-tenant**: business data must be scoped by tenant; never trust `tenant_id` from the client without binding to the authenticated context.

## Frontend (Next.js)

- App Router under **`apps/web/app`** (not `src/app` in this repo).
- UI: **shadcn/ui** (`components/ui`), styling Tailwind v4 + tokens in `app/globals.css`.
- Server state: **TanStack Query** with **`fetch`** via central **`lib/api-client.ts`** (`apiFetch`) and `NEXT_PUBLIC_API_URL`.
- Client UI state: **Zustand** under `stores/`.
- Forms: **React Hook Form** (add **Zod** + resolvers when schemas grow).
- Animation: **Framer Motion** in client components only.
- Icons: **react-icons** app-wide; **lucide-react** often pulled by shadcn blocks — both allowed.
- Separate route groups later: public auth, tenant app, platform admin (different layouts/routes; same repo).
- Detailed conventions: read [docs/skills/nextjs-skill.md](../../../docs/skills/nextjs-skill.md).

## Backend (NestJS)

- Organize by modules: `auth`, `users`, `tenants`, `subscriptions`, `payments`, `events`, `participants`, `draws`, `uploads`, `audit`.
- Validate input with DTOs; apply guards for auth, roles, and subscription/quota.
- Detailed conventions: read [docs/skills/nestjs-skill.md](../../../docs/skills/nestjs-skill.md).

## Scripts (from repository root)

| Command | Purpose |
|--------|---------|
| `npm run dev:web` | Next dev server |
| `npm run dev:api` | Nest watch |
| `npm run lint:web` | ESLint web |
| `npm run lint:api` | ESLint api |

## Do not

- Add broad refactors unrelated to the request.
- Commit secrets; use env vars and document placeholders only.
