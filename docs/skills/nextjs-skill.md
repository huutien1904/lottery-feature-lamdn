# Next.js skill guide (apps/web)

## Mục tiêu

- Xây dựng frontend SaaS ổn định, mở rộng tốt, bảo trì dễ.
- Tách rõ: UI (shadcn) · state (Zustand) · data server (TanStack Query + `fetch`) · form (React Hook Form) · chuyển động (Framer Motion).

## Stack đã chốt

| Công nghệ | Vai trò |
|-----------|---------|
| **Next.js 16 (App Router)** | Routing, RSC, layout, metadata. |
| **Tailwind CSS v4** + **shadcn/ui** | UI, design tokens (`app/globals.css`), component `components/ui/*`. |
| **TanStack Query** | Cache, loading/error, gọi API; bọc bởi `app/providers.tsx` → `QueryClientProvider`. |
| **`lib/api-client.ts` (`apiFetch`)** | Mọi request tới **Nest** dùng `fetch` thống nhất + `NEXT_PUBLIC_API_URL`. |
| **Zustand** | State UI / client (ví dụ `stores/ui-store.ts`); **không** dùng cho dữ liệu nghiệp vụ từ server. |
| **React Hook Form** | Form, validation; ưu tiên kết hợp **Zod** + `@hookform/resolvers` khi cần schema phức tạp. |
| **Framer Motion** | Animation màn hình, card, draw — bọc Client Component, tránh vô tội vạ ở RSC. |
| **react-icons** | Icon ứng dụng (đa bộ). **lucide-react** vẫn là icon mặc định của nhiều block shadcn; dùng lẫn được. |

## Cấu trúc thư mục đề xuất

- Route App Router: **`apps/web/app`** (repo hiện không dùng `src/app`; giữ nguyên convention này).
- **`components/ui`** — component shadcn sinh bởi CLI (`npx shadcn@latest add …`).
- **`components`** — section/feature Client Components.
- **`lib`** — `utils.ts` (`cn`), `api-client.ts`, helpers.
- **`stores`** — Zustand slices.

Phân route nhóm (sau này):

- `(public)` — landing, login
- `(app)` — dashboard khách
- `(admin)` — admin nền tảng

## Quy tắc code

- Ưu tiên **Server Components** cho trang chỉ đọc dữ liệu ít tương tác.
- Dùng **`"use client"`** cho: TanStack Query, RHF, Zustand, Motion, input có state cục bộ phức tạp.
- **Gọi API backend**: chỉ qua `apiFetch()` trong `queryFn` / `mutationFn`, không `fetch` rải rác tới `NEXT_PUBLIC_API_URL`.
- **Gọi API bên thứ ba** (CDN, public demo): có thể `fetch` trực tiếp trong query hoặc bọc helper riêng — không trộn với `apiFetch` nếu không cùng auth/CORS.

```ts
// Ví dụ pattern
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

useQuery({
  queryKey: ["me"],
  queryFn: () => apiFetch<{ id: string }>("/v1/me"),
});
```

## Form

- Dùng **React Hook Form** cho mọi form CRUD.
- Validation đơn giản: `register` + rules inline.
- Form có schema phức tạp / chia reuse: thêm **Zod** + **`@hookform/resolvers`** (cài khi bắt đầu module auth/import).

## shadcn/ui

- Thêm component: `cd apps/web && npx shadcn@latest add <name>`.
- Giữ `components.json`; theme và biến CSS nằm ở `app/globals.css`.
- Nút / link: phiên bản hiện tại có thể không hỗ trợ `asChild`; dùng `buttonVariants` + thẻ `<a>` hoặc `next/link` khi cần.

## Motion

- Bọc section hoặc page shell trong `motion.*`; giảm animation trên reduced-motion nếu sau này cần a11y.

## Auth & tenant (nhắc ngắn)

- Token/session do backend kiểm soát; FE chỉ hiển thị menu theo role — luật thật vẫn ở Nest.

## Env

- Sao chép `apps/web/.env.example` → `.env.local`.
- `NEXT_PUBLIC_API_URL` trỏ Nest (không slash cuối).

## Testing & quality

- ESLint (Next config).
- Husky + lint-staged chỉ chạy lint khi staged file trong `apps/web`.

## Definition of Done

- Trang có loading / empty / error state khi dùng TanStack Query.
- Form có hiển thị lỗi validation.
- Không hardcode URL API — dùng env + `apiFetch`.
