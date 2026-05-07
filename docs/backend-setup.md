# Backend setup (NestJS + Prisma + PostgreSQL)

## 1) Start PostgreSQL

From repo root:

```bash
docker compose up -d postgres
```

This starts local DB:

- host: `localhost`
- port: `55432`
- user: `lottery`
- password: `lottery`
- database: `lottery_saas`

## 2) Configure API env

Copy `apps/api/.env.example` to `apps/api/.env` and set:

```env
DATABASE_URL="postgresql://lottery:lottery@localhost:55432/lottery_saas?schema=public"
PORT=3001
```

## 3) Prisma commands

Run from repo root:

```bash
npm run prisma:format --workspace apps/api
npm run prisma:generate --workspace apps/api
npm run prisma:migrate:dev --workspace apps/api -- --name init
npm run prisma:seed --workspace apps/api
```

Open Prisma Studio:

```bash
npm run prisma:studio --workspace apps/api
```

## 4) Run API

```bash
npm run start:dev --workspace apps/api
```

