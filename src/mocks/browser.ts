import { setupWorker } from 'msw/browser';

import { env } from '@/lib/env';
import { createHandlers } from '@/shared/mocks';

// Handler'lar API manziliga bog'lanadi — wildcard ishlatilsa, ular Vite'ning
// dev modul so'rovlarini ham ushlab qolardi.
export const worker = setupWorker(...createHandlers(env.apiUrl));

/**
 * Bu modul faqat dinamik import orqali yuklanadi (`main.tsx` ga qarang),
 * shuning uchun MSW production bundle'iga tushmaydi.
 */
export async function enableMocking(): Promise<void> {
  await worker.start({
    // Mock qilinmagan so'rovlar (rasm, shrift, Vite modullari) o'tib ketsin.
    onUnhandledRequest: 'bypass',
  });
}
