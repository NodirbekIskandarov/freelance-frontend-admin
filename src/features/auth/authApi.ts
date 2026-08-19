import { toAuthTokens } from '@/shared/types/api';
import type { AuthResponse, CurrentUser, LoginRequest } from '@/shared/types/auth';
import { baseApi, tokenStore } from '@/store/api';

/**
 * Auth — haqiqiy backend (`/api/v1/auth/login/`).
 *
 * Admin endpoint'lari `Admin/Moderator only` va JWT talab qiladi,
 * shuning uchun haqiqiy token'siz panel umuman ishlamaydi.
 */

const CURRENT_USER_KEY = 'admin.auth.user';

/**
 * Backendda "joriy foydalanuvchi" endpoint'i yo'q (sxemada `/api/v1/me/`
 * faqat kutubxona uchun). Shu sababli login javobidagi foydalanuvchi
 * saqlanadi va sahifa yangilanganda shundan tiklanadi. Token yaroqsiz
 * bo'lsa `baseQuery` baribir login sahifasiga qaytaradi — bu yozuv
 * ruxsat manbai emas, faqat ko'rsatish uchun.
 */
export function readStoredUser(): CurrentUser | null {
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

function storeUser(user: CurrentUser | null): void {
  try {
    if (user) window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(CURRENT_USER_KEY);
  } catch {
    // Storage yopiq bo'lsa jim o'tamiz — seans baribir token bilan ishlaydi.
  }
}

export function clearSession(): void {
  tokenStore.clear();
  storeUser(null);
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login/', method: 'POST', body }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          tokenStore.setTokens(toAuthTokens(data.tokens));
          storeUser(data.user);
        } catch {
          // Xato komponentda `error` orqali ko'rsatiladi. Ushlanmasa
          // brauzerda "unhandled rejection" chiqadi.
        }
      },
    }),

    /**
     * Backend refresh token'ni qora ro'yxatga qo'shadi, shuning uchun uni
     * tanada yuborish shart. 205 qaytaradi — bu xato emas.
     */
    logout: build.mutation<void, { refresh: string }>({
      query: (body) => ({ url: '/auth/logout/', method: 'POST', body }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation } = authApi;
