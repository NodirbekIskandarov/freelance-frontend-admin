import { createApi } from '@reduxjs/toolkit/query/react';
import { createAppBaseQuery, createLocalStorageTokenStore } from '@/shared/api';

import { env } from '@/lib/env';
import { DEFAULT_LOCALE, localeFromPathname, localizeHref } from '@/i18n/config';

export const tokenStore = createLocalStorageTokenStore('admin.auth');

/**
 * Bo'sh `endpoints` — har bir domen o'z faylida `injectEndpoints()`
 * orqali qo'shiladi (masalan `src/features/users/usersApi.ts`).
 */
export const baseApi = createApi({
  reducerPath: 'api',
  /*
   * Ulanish tiklanganda qayta so'ralsin.
   *
   * Admin panelida noutbuk yopib-ochiladi, wifi uziladi. Standart holatda
   * kesh eskirgan holida qolib, moderator allaqachon ko'rib chiqilgan
   * navbatga qarab o'tirardi. Fokus bo'yicha qayta so'rash YOQILMADI: har
   * oyna almashishda o'nlab so'rov ketardi va bu foydadan ko'ra shovqin.
   */
  refetchOnReconnect: true,
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
      /* Til bo'lagi saqlanadi: `/ru/...` da ishlagan xodim login
         sahifasida ham ruscha matn ko'rishi kerak. */
      const locale = localeFromPathname(window.location.pathname) ?? DEFAULT_LOCALE;
      window.location.href = localizeHref('/login', locale);
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
    'Dispute',
    'Appeal',
    'Wallet',
    'Withdrawal',
    'ExchangeTask',
    'Audit',
    'Role',
    'Permission',
    'LoginMethod',
    'Comment',
  ],
  endpoints: () => ({}),
});
