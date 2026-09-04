/**
 * Jadval zichligi — foydalanuvchining doimiy tanlovi.
 *
 * Nega kerak: bir admin kuniga o'nlab qatorni ko'zdan kechiradi va unga
 * ekranga ko'proq qator sig'gani muhim; boshqasi kuniga bir necha marta
 * kiradi va unga bo'sh joy muhimroq. Bitta qiymat ikkalasiga ham
 * to'g'ri kelmaydi.
 *
 * `theme.ts` bilan bir xil naqsh: holat `localStorage` da yashaydi,
 * React unga `useSyncExternalStore` bilan obuna bo'ladi. Ikki nusxa
 * bo'lsa boshqa yorliqda almashtirilganda ular bir-biridan uzoqlashardi.
 */

export type Density = 'comfortable' | 'compact';

const KEY = 'admin.density';

const listeners = new Set<() => void>();

export function getDensity(): Density {
  if (typeof window === 'undefined') return 'comfortable';
  try {
    return window.localStorage.getItem(KEY) === 'compact' ? 'compact' : 'comfortable';
  } catch {
    // Private rejim yoki storage o'chirilgan — sukut bo'yicha keng.
    return 'comfortable';
  }
}

export function setDensity(value: Density): void {
  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    // Saqlab bo'lmasa ham joriy sahifada zichlik o'zgarsin.
  }
  for (const listener of listeners) listener();
}

export function subscribeToDensity(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}
