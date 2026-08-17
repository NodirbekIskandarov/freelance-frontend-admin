import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // `VITE_` prefiksisiz o'zgaruvchi brauzerga tushmaydi — proksi manzili
  // faqat dev serverga kerak, shuning uchun ataylab prefiksiz.
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
       * `:5173` uchun preflight `Access-Control-Allow-Origin` bermaydi).
       * Proksi orqali so'rov brauzer uchun same-origin bo'lib qoladi va
       * CORS umuman qo'llanmaydi. Production'da xuddi shu vazifani
       * `docker/default.conf.template` dagi nginx bajaradi.
       *
       * MSW proksidan OLDIN ishlaydi: mock qilingan yo'llar service
       * worker'da ushlanadi, qolganlari (masalan
       * `/api/v1/admin/solutions/...`) shu yerdan haqiqiy serverga o'tadi.
       */
      proxy: {
        '/api': {
          target: env.API_UPSTREAM || 'https://api.yopamiz.uz',
          changeOrigin: true,
        },
      },
    },
  };
});
