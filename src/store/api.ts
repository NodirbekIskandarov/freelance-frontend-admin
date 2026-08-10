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
    onAuthFailure: () => {
      window.location.href = '/login';
    },
  }),
  tagTypes: ['User', 'Product'],
  endpoints: () => ({}),
});
