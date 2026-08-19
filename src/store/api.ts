import { createApi } from '@reduxjs/toolkit/query/react';
import { createAppBaseQuery, createLocalStorageTokenStore } from '@/shared/api';

import { env } from '@/lib/env';

export const tokenStore = createLocalStorageTokenStore('admin.auth');

/**
 * Bo'sh `endpoints` — har bir domen o'z faylida `injectEndpoints()`
 * orqali qo'shiladi (masalan `src/features/users/usersApi.ts`).
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: createAppBaseQuery({
    baseUrl: env.apiUrl,
    tokens: tokenStore,
    /*
     * Refresh ham ishlamadi — seansni butunlay tozalaymiz.
     * `tokenStore.clear()` ni `baseQuery` o'zi chaqiradi, bu yerda esa
     * saqlangan foydalanuvchi yozuvi o'chiriladi: aks holda login
     * sahifasida eski admin nomi ko'rinib turardi.
     */
    onAuthFailure: () => {
      try {
        window.localStorage.removeItem('admin.auth.user');
      } catch {
        // ignore
      }
      window.location.href = '/login';
    },
  }),
  tagTypes: [
    'User',
    'Product',
    'Institute',
    'Subject',
    'Task',
    'Solution',
    'Variant',
    'Dashboard',
    'Application',
    'Freelancer',
    'Request',
    'Report',
    'Appeal',
    'Wallet',
    'Withdrawal',
    'ExchangeTask',
    'Audit',
  ],
  endpoints: () => ({}),
});
