/**
 * Muhit o'zgaruvchilari bir joyda tekshiriladi.
 * Vite'da faqat `VITE_` prefiksli o'zgaruvchilar brauzerga tushadi.
 */

/**
 * Oxiridagi `/` OLIB TASHLANADI.
 *
 * Yo'llar `/auth/login/` ko'rinishida yoziladi, shuning uchun bazaviy
 * manzil `…/api/v1/` bo'lsa `…/api/v1//auth/login/` hosil bo'ladi va
 * server buni 404 qaytaradi (ikkilangan slashni yig'ishtirmaydi).
 * Sozlamadagi bitta ortiqcha belgi butun ilovani ishdan chiqarmasin.
 */
function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  throw new Error(
    'VITE_API_URL sozlanmagan. `apps/admin/.env.local` faylini `.env.example` dan nusxalang.',
  );
}

const apiUrl = trimSlash(rawApiUrl);

export const env = {
  apiUrl,
  isProduction: import.meta.env.PROD,
} as const;
