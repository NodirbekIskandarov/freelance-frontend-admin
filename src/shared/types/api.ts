/**
 * Bu faylda IKKI XIL shakl bor va ular ataylab aralashtirilmagan:
 *
 * 1. `Paginated`, `ListQuery`, `ApiErrorBody` — mock endpoint'lar uchun
 *    o'ylab topilgan konvensiya. Backendda hali bu bo'limlar yo'q.
 * 2. `DrfPaginated`, `TokenPair` va h.k. — haqiqiy backend shakli
 *    (`https://api.yopamiz.uz/api/schema/`). Yangi endpoint ulanganda
 *    aynan shular ishlatiladi.
 *
 * Mock bo'limlar haqiqiy API'ga ko'chgan sari birinchi guruh yo'qoladi.
 */

/** Ro'yxat endpoint'lari uchun sahifalash meta ma'lumoti. */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Sahifalangan javob. */
export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

/** Ro'yxat so'rovlarining umumiy query parametrlari. */
export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}
