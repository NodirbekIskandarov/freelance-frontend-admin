import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    /*
     * `/api` haqiqiy backendga proksilanadi.
     *
     * To'g'ridan-to'g'ri `https://api.yopamiz.uz` ga murojaat qilib
     * bo'lmaydi: backend CORS ro'yxatida `http://localhost:3000` bor,
     * `:5173` esa yo'q — brauzer so'rovni bloklaydi (tekshirilgan:
     * preflight `:5173` uchun `Access-Control-Allow-Origin` bermaydi).
     * Proksi orqali so'rov brauzer uchun bir xil manzilda (same-origin)
     * bo'lib qoladi va CORS umuman qo'llanmaydi.
     *
     * MSW proksidan OLDIN ishlaydi: mock qilingan yo'llar service worker'da
     * ushlanadi, qolganlari (masalan `/api/v1/admin/solutions/...`) shu
     * yerdan haqiqiy serverga o'tadi.
     */
    proxy: {
      '/api': {
        target: 'https://api.yopamiz.uz',
        changeOrigin: true,
      },
    },
  },
});
