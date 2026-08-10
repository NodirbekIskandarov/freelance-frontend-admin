/**
 * Muhit o'zgaruvchilari bir joyda tekshiriladi.
 * Vite'da faqat `VITE_` prefiksli o'zgaruvchilar brauzerga tushadi.
 */

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    'VITE_API_URL sozlanmagan. `apps/admin/.env.local` faylini `.env.example` dan nusxalang.',
  );
}

export const env = {
  apiUrl,
  isProduction: import.meta.env.PROD,
} as const;
