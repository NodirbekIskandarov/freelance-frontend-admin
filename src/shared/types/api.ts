/**
 * Backend shartnomasining umumiy shakllari
 * (`https://api.yopamiz.uz/api/schema/`).
 */

/** Backend qaytaradigan xato tanasi. */
export interface ApiErrorBody {
  message: string;
  /** Maydon nomi -> xato matnlari. Form validatsiyasi uchun. */
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * Backendning sahifalash javobi.
 *
 * Diqqat: Swagger sxemasida (`PaginatedSolutionList`) faqat
 * `count/next/previous/results` yozilgan, lekin server aslida `page`,
 * `page_size` va `total_pages` ni ham qaytaradi — brauzerdan tekshirilgan.
 * `total_pages` borligi uchun uni `count` dan hisoblash shart emas.
 */
export interface ApiPaginated<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Sahifalangan ro'yxatlarning umumiy query parametrlari. */
export interface ApiListQuery {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

/**
 * Backend qaytaradigan token juftligi (`TokenPair`).
 * Saqlash shakli (`AuthTokens`) bundan farq qiladi — pastga qarang.
 */
export interface TokenPair {
  access: string;
  refresh: string;
}

/**
 * Token'larning ILOVA ICHIDAGI shakli.
 *
 * Ataylab `TokenPair`dan ajratilgan: `TokenStore` — saqlash abstraksiyasi
 * va u backendning maydon nomlariga bog'lanmasligi kerak. Simdan kelgan
 * shakl faqat `baseQuery` va `authApi` chegarasida tarjima qilinadi.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function toAuthTokens(pair: TokenPair): AuthTokens {
  return { accessToken: pair.access, refreshToken: pair.refresh };
}
