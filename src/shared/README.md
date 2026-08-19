# `src/shared/` — ikki loyihada takrorlanadigan kod

Bu papkadagi fayllar **`admin` loyihasida ham xuddi shunday** turadi.

## Nega takrorlangan?

`web` va `admin` alohida git repository'larga push qilinadi. Alohida repo'lar
bir-birining papkasini import qila olmaydi — `admin` repo'sini toza klonlaganda
`web` papkasi umuman bo'lmaydi.

Uch xil yechim bor edi:

| Yechim | Nega tanlanmadi |
|---|---|
| npm paket (privat registry) | Har o'zgarish uchun versiya chiqarish, token sozlash — bu hajmdagi loyihaga ortiqcha |
| Git submodule | Klonlash va CI murakkablashadi, freelance topshiruvda muammo tug'diradi |
| **Kod nusxasi** ✅ | ~250 qator. Oddiy, hech qanday infratuzilma talab qilmaydi |

## Nimalar bor

| Fayl | Vazifasi |
|---|---|
| `api/baseQuery.ts` | RTK Query base query: token qo'shish, 401 da refresh (single-flight) |
| `api/tokenStore.ts` | Token saqlash abstraksiyasi (localStorage / bo'sh) |
| `api/errors.ts` | RTK Query xatosidan foydalanuvchiga matn ajratish |
| `types/api.ts` | Backend DTO tiplari — **API shartnomasi kelgach birinchi shu yer o'zgaradi** |
| `styles/tokens.css` | Tailwind v4 dizayn tokenlari |

## Sinxron saqlash

Shu papkada biror narsa o'zgarsa, **ikkinchi loyihaga ham ko'chirish kerak**.

```bash
# web -> admin
cp -r web/src/shared/. admin/src/shared/

# admin -> web
cp -r admin/src/shared/. web/src/shared/
```

Faqat shu papkaga tegishli — loyihaga xos kod (`src/store/`, `src/app/`,
`src/pages/`) ikkalasida boshqacha va ko'chirilmaydi.

**Sinxron bo'lishi shart emas:**

| Fayl | Nega |
|---|---|
| `styles/tokens.css` | Admin va sayt dizayni butunlay boshqa |
| `types/dashboard.ts` | Faqat adminda bor sahifaga tegishli |

Ya'ni sinxronlash `api/` va umumiy `types/api.ts` ga tegishli —
ular ikkala loyiha uchun bir xil backend shartnomasini ifodalaydi.

> Agar keyinchalik loyiha o'ssa va sinxronlash bezovta qila boshlasa,
> bu papkani privat npm paketiga (`@sizning-nom/shared`) ajratish mumkin —
> kod tuzilishi shunga tayyor holda yozilgan.
