import type { AuthTokens } from '../types/api';

/**
 * Token'lar qayerda saqlanishi appga bog'liq:
 * admin (SPA) — localStorage, web (Next SSR) — cookie yoki memory.
 * Shu sababli saqlash joyi tashqaridan beriladi, umumiy kod undan mustaqil.
 */
export interface TokenStore {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  setTokens(tokens: AuthTokens): void;
  clear(): void;
}

/** SSR paytida (server tomonda) hech narsa saqlamaydigan bo'sh store. */
export const noopTokenStore: TokenStore = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setTokens: () => {},
  clear: () => {},
};

/**
 * Brauzer localStorage'iga tayangan store.
 * SSR paytida `window` bo'lmaydi — shuning uchun har chaqiruvda tekshiriladi.
 */
export function createLocalStorageTokenStore(prefix = 'auth'): TokenStore {
  const accessKey = `${prefix}.accessToken`;
  const refreshKey = `${prefix}.refreshToken`;

  const read = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Private mode yoki storage o'chirilgan bo'lsa — token yo'q deb hisoblaymiz.
      return null;
    }
  };

  return {
    getAccessToken: () => read(accessKey),
    getRefreshToken: () => read(refreshKey),
    setTokens: ({ accessToken, refreshToken }) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(accessKey, accessToken);
        window.localStorage.setItem(refreshKey, refreshToken);
      } catch {
        // Yozib bo'lmasa jim o'tamiz — so'rov baribir 401 bilan qaytadi.
      }
    },
    clear: () => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.removeItem(accessKey);
        window.localStorage.removeItem(refreshKey);
      } catch {
        // ignore
      }
    },
  };
}
