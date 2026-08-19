import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';

import { toAuthTokens, type TokenPair } from '../types/api';
import type { TokenStore } from './tokenStore';

export type AppBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
>;

export interface CreateBaseQueryOptions {
  /** Masalan: `https://api.example.com/v1` */
  baseUrl: string;
  tokens: TokenStore;
  /**
   * `baseUrl`ga nisbatan refresh endpoint yo'li.
   * Oxiridagi slash SHART: Django `APPEND_SLASH` bilan slashsiz manzilni
   * 301 bilan qaytaradi va POST tanasi yo'qoladi.
   */
  refreshPath?: string;
  /** Refresh ham ishlamaganda chaqiriladi — odatda logout + login sahifasiga yo'naltirish. */
  onAuthFailure?: () => void;
}

/** Refresh javobi kutilgan shaklga mos kelishini tekshiradi. */
function isTokenPair(value: unknown): value is TokenPair {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.access === 'string' && typeof candidate.refresh === 'string';
}

/**
 * Haqiqiy backend har bir javobni konvertga o'raydi:
 * `{ "success": true, "data": …, "errors": null }`.
 *
 * Diqqat: Swagger buni KO'RSATMAYDI — sxemada yalang'och obyekt turibdi,
 * konvert esa middleware'da qo'shiladi (brauzerdan tekshirilgan).
 * Shuning uchun ochish har bir endpoint'da emas, shu yerda bir marta
 * bajariladi — aks holda har `transformResponse` da takrorlanardi.
 *
 * Tekshiruv qat'iy: faqat `success` mantiqiy va `data` kaliti bor
 * obyekt ochiladi — boshqasiga tegilmaydi.
 */
function isEnvelope(value: unknown): value is { success: boolean; data: unknown } {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.success === 'boolean' && 'data' in candidate;
}

function unwrap(value: unknown): unknown {
  return isEnvelope(value) ? value.data : value;
}

/**
 * 401 javobi "seans tugadi" degani BO'LMAGAN yo'llar — bular refresh va
 * redirect oqimiga umuman tushmaydi.
 */
const AUTH_PATHS = ['/auth/login/', '/auth/register/', '/auth/refresh/'] as const;

/**
 * Token qo'shadigan va 401 da bir marta refresh qilib so'rovni qaytadan
 * yuboradigan base query.
 *
 * Bir vaqtda bir nechta so'rov 401 olsa, refresh faqat bir marta ketadi —
 * qolganlari o'sha promise'ni kutadi (single-flight). Aks holda har bir
 * so'rov alohida refresh yuborib, refresh token'ni bekor qilib qo'yishi mumkin.
 */
export function createAppBaseQuery({
  baseUrl,
  tokens,
  refreshPath = '/auth/refresh/',
  onAuthFailure,
}: CreateBaseQueryOptions): AppBaseQuery {
  const fetchQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const accessToken = tokens.getAccessToken();
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return headers;
    },
  });

  /**
   * `fetchBaseQuery` ustiga konvertni ochish qatlami.
   *
   * Muvaffaqiyat shoxi ATAYLAB yangidan quriladi, `{...result}` bilan
   * emas: RTK Query natijasi diskriminatsiyalangan birlashma va spread
   * `data` bilan `error` ni bir obyektda uchratib yuboradi — tip
   * darajasida ham, mantiqan ham noto'g'ri holat.
   */
  const rawBaseQuery: AppBaseQuery = async (args, api, extraOptions) => {
    const result = await fetchQuery(args, api, extraOptions);
    if (result.error) return result;
    return { data: unwrap(result.data), meta: result.meta };
  };

  let refreshInFlight: Promise<boolean> | null = null;

  const runRefresh = async (
    api: Parameters<AppBaseQuery>[1],
    extraOptions: Parameters<AppBaseQuery>[2],
  ): Promise<boolean> => {
    const refreshToken = tokens.getRefreshToken();
    if (!refreshToken) return false;

    const result = await rawBaseQuery(
      { url: refreshPath, method: 'POST', body: { refresh: refreshToken } },
      api,
      extraOptions,
    );

    if (result.error || !isTokenPair(result.data)) {
      return false;
    }

    tokens.setTokens(toAuthTokens(result.data));
    return true;
  };

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    const requestUrl = typeof args === 'string' ? args : args.url;
    const isUnauthorized = result.error?.status === 401;

    /*
     * Auth endpoint'idan kelgan 401 — bu "seans tugadi" emas, "login yoki
     * parol xato". Uni refresh + redirect oqimiga qo'shib yuborish MUMKIN
     * EMAS: refresh token yo'qligi sababli oqim `onAuthFailure` ga tushadi,
     * u esa sahifani qaytadan yuklaydi va xato xabari ko'rinmasdan
     * yo'qoladi. Brauzerda aynan shu kuzatilgan — forma tozalanib,
     * foydalanuvchi nima bo'lganini bilmay qolardi.
     */
    const isAuthRequest = AUTH_PATHS.some((authPath) => requestUrl.startsWith(authPath));

    if (!isUnauthorized || isAuthRequest) {
      return result;
    }

    // Refresh allaqachon ketayotgan bo'lsa — yangisini boshlamay, o'shani kutamiz.
    refreshInFlight ??= runRefresh(api, extraOptions).finally(() => {
      refreshInFlight = null;
    });

    const refreshed = await refreshInFlight;

    if (!refreshed) {
      tokens.clear();
      onAuthFailure?.();
      return result;
    }

    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  };
}
