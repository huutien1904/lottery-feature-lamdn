# NestJS Skill Guide

## Muc tieu

- Xay dung backend SaaS theo huong module, de scale va de kiem soat quyen.
- Dam bao multi-tenant, billing, trial/pro va audit log ngay tu dau.

## Cau truc module de xuat

- `auth` - dang ky, dang nhap, refresh token
- `users` - thong tin tai khoan
- `tenants` - workspace doanh nghiep
- `memberships` - role trong tenant
- `plans` - dinh nghia goi dich vu
- `subscriptions` - trial/pro, han su dung
- `payments` - giao dich va webhook
- `events` - su kien quay thuong
- `participants` - nguoi tham gia
- `draws` - phien quay, ket qua quay
- `uploads` - presigned URL, xac nhan file
- `audit-logs` - nhat ky thao tac

## Nguyen tac thiet ke

- Moi resource nghiep vu phai co `tenant_id`.
- Dung guard cho:
  - authentication
  - role authorization
  - subscription/quota authorization
- Khong trust data tu client cho `tenant_id`; lay tu context token/session.

## PostgreSQL va ORM

- Uu tien Prisma cho toc do phat trien va migration ro rang.
- Prisma setup hien tai:
  - `apps/api/prisma/schema.prisma`
  - `apps/api/prisma.config.ts` (doc `DATABASE_URL` tu env)
  - scripts: `prisma:format`, `prisma:generate`, `prisma:migrate:dev`, `prisma:migrate:deploy`, `prisma:studio`
- Bat buoc index cho cot truy van nhieu:
  - `tenant_id`
  - `event_id`
  - `created_at`
- Dung unique key nghiep vu:
  - `(tenant_id, event_id, participant_code)`

## Rule Trial/Pro (theo san pham hien tai)

- Trial:
  - 14 ngay
  - toi da 15 participants moi event
  - khong duoc upload avatar participant
- Pro:
  - cho import so luong lon
  - cho upload avatar

## API convention

- Prefix: `/api/v1`
- Tra ve format nhat quan:
  - `data`
  - `meta`
  - `error` (neu co)
- Bat loi bang exception filter chung.
- Validate request voi `class-validator` + DTO.

## Security

- Hash password bang `argon2` hoac `bcrypt`.
- Rate limit endpoint auth/import/upload.
- Kiem tra mime type va file size truoc khi cap presigned URL.
- Webhook payment phai idempotent (tranh ghi nhan trung).

## Background jobs

- Xu ly import Excel theo job queue neu file lon.
- Gui email nhac trial sap het han.
- Dong bo trang thai subscription theo webhook.

## Testing va quality

- Unit test service quan trong:
  - subscription policy
  - participant import validation
  - draw business rules
- Integration test cho module auth, participants, billing.
- E2E cho luong:
  - dang ky -> trial
  - import participants
  - nang cap pro
- Bat buoc lint xanh truoc commit.

## Definition of Done

- API co swagger hoac tai lieu endpoint toi thieu.
- Guard va policy duoc ap dung dung endpoint.
- Co audit log cho thao tac quan trong (import, draw, reset, billing).
- Co migration va seed data cho plans mac dinh.
