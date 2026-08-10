import { handlers } from '@/shared/mocks';
import { setupWorker } from 'msw/browser';

export const worker = setupWorker(...handlers);

/**
 * Bu modul faqat dinamik import orqali yuklanadi (`main.tsx` ga qarang),
 * shuning uchun MSW production bundle'iga tushmaydi.
 */
export async function enableMocking(): Promise<void> {
  await worker.start({
    // Mock qilinmagan so'rovlar (rasm, shrift) haqiqiy tarmoqqa o'tsin.
    onUnhandledRequest: 'bypass',
  });
}
