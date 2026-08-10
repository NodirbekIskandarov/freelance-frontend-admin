# Admin panel

React 19 · Vite 8 · TypeScript · Redux Toolkit + RTK Query · Tailwind CSS v4 · react-router

Sayt (front) alohida loyiha va alohida repository'da — `web/`.

## Ishga tushirish

```bash
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:5173`

## Skriptlar

| Skript | Vazifasi |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Build qilingan versiyani ko'rish |
| `npm run typecheck` | TS tekshiruvi |
| `npm run lint` | oxlint |
| `npm run format` | Prettier |

## Muhit o'zgaruvchilari

| O'zgaruvchi | Izoh |
|---|---|
| `VITE_API_URL` | Backend manzili |
| `VITE_ENABLE_MOCKS` | `true` — MSW mock API (backend tayyor bo'lguncha) |

## Struktura

```
src/
  app/router.tsx  Marshrutlar
  layouts/        Sahifa karkaslari (sidebar, header)
  pages/          Sahifalar
  store/
    api.ts        RTK Query baseApi — endpoint'lar injectEndpoints bilan qo'shiladi
    index.ts      Store (SPA — bitta global store yetarli)
    hooks.ts      Tiplangan useAppDispatch / useAppSelector
  shared/         web bilan umumiy kod — src/shared/README.md ga qarang
  mocks/          MSW worker (faqat dev)
  lib/env.ts      Muhit o'zgaruvchilari
```

### API endpoint qo'shish

Bitta ulkan api fayli o'smasligi uchun har domen o'z faylida:

```ts
// src/features/users/usersApi.ts
import { baseApi } from '@/store/api';
import type { Paginated, ListQuery, User } from '@/shared/types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<Paginated<User>, ListQuery>({
      query: (params) => ({ url: '/users', params }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
```

## Backend

Backend hali yo'q. `VITE_ENABLE_MOCKS=true` bo'lganda so'rovlarni MSW ushlab,
`src/shared/mocks/` dagi soxta ma'lumotni qaytaradi. Production build'da MSW
butunlay tashlanadi — bundle'ga tushmaydi.

Backend tayyor bo'lgach: `src/shared/types/api.ts` ni real API shakliga
moslash → `VITE_ENABLE_MOCKS=false` → `src/mocks/` va `src/shared/mocks/`
ni o'chirish.

## Dizayn

Figma eksporti `../design/` papkasida (repository'dan tashqarida).
Ranglar va shriftlar `src/shared/styles/tokens.css` da — hozircha
vaqtinchalik qiymatlar, `design/tokens/tokens.md` to'lgach almashtiriladi.
