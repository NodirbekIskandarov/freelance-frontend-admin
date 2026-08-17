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

## Docker

```bash
docker compose up --build          # dev server → http://localhost:8091
docker compose --profile prod up --build   # build + nginx → http://localhost:8091
```

| Servis | Rejim | Izoh |
|---|---|---|
| `admin` (default) | Vite dev | HMR, MSW mock'lari ishlaydi |
| `admin-prod` (`--profile prod`) | nginx + `dist/` | MSW yo'q — real backend kerak |

`VITE_*` o'zgaruvchilar dev'da `environment` orqali, prod'da build arg orqali
uzatiladi (Vite ularni build paytida bundle'ga yozadi, runtime'da o'qimaydi).
Qiymatlarni o'zgartirish uchun repo ildizida `.env` fayl yarating:

```
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_MOCKS=true
```

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

## Deploy (CI/CD)

`main` ga push bo'lishi bilan `.github/workflows/deploy.yml` ishga tushadi:
kodni tortadi va konteynerni qayta quradi. Natija (muvaffaqiyat yoki xatolik)
Telegram guruhiga yuboriladi.

Job **self-hosted runner** da, ya'ni serverning o'zida bajariladi — GitHub
Actions daqiqalari sarflanmaydi va SSH kaliti kerak emas.

Server manzili: `/var/www/yopamiz-front/freelance-frontend-admin`

GitHub repo secrets (Settings → Secrets and variables → Actions):

| Secret | Nima |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | Bot tokeni |
| `TELEGRAM_CHAT_ID` | Guruh/chat id |
| `TELEGRAM_THREAD_ID` | Forum mavzusi id — ixtiyoriy, bo'sh qoldirilsa ishlatilmaydi |

Serverda bir martalik tayyorgarlik:

```bash
mkdir -p /var/www/yopamiz-front
cd /var/www/yopamiz-front
git clone git@github-admin:NodirbekIskandarov/freelance-frontend-admin.git
cd freelance-frontend-admin
cp .env.prod.example .env   # qiymatlarni to'ldiring
docker compose -f docker-compose.prod.yml up -d --build
```

Bunga qo'shimcha ravishda self-hosted runner o'rnatiladi (Settings → Actions →
Runners → New self-hosted runner), va `svc.sh install` bilan servis qilinadi.
Runner ishlaydigan foydalanuvchi: `docker` guruhida bo'lishi, yuqoridagi
katalogga yozish huquqiga va `git pull` uchun deploy key'ga (`~/.ssh/gh_admin`)
ega bo'lishi kerak.

### Zaxira deploy (cron)

Actions ishlamay qolsa (billing bloki va h.k.) `scripts/autodeploy.sh` serverda
cron orqali ishlaydi: `origin/main` da yangi commit bo'lsa deploy qiladi va
natijani Telegram'ga yuboradi. Bir martalik sozlash:

```bash
# Telegram sozlamalari (repoga tushmaydi)
cat > /etc/yopamiz-admin-deploy.env <<'EOF'
TG_TOKEN=<bot tokeni>
TG_CHAT=<chat id>
TG_THREAD=<thread id yoki bo'sh>
EOF
chmod 600 /etc/yopamiz-admin-deploy.env

# Har 2 daqiqada tekshirish
( crontab -l 2>/dev/null
  echo "*/2 * * * * /var/www/yopamiz-front/freelance-frontend-admin/scripts/autodeploy.sh" ) | crontab -
```

Log: `/var/log/yopamiz-admin-deploy.log`. Actions qayta ishlay boshlagach
cron'ni `crontab -e` bilan o'chirib qo'ying.

`.env` dagi `VITE_*` qiymatlari build paytida bundle'ga yoziladi —
o'zgartirgandan keyin qayta build kerak (deploy `--build` bilan ishlaydi,
qo'lda esa `docker compose -f docker-compose.prod.yml up -d --build`).
