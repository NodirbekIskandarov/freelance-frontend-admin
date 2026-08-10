/**
 * Backend hali tayyor emas. Bu yerdagi shakllar — keng tarqalgan konvensiya.
 * API shartnomasi (Swagger) kelgach shu fayl birinchi bo'lib moslanadi;
 * qolgan kod faqat shu tiplarga tayangani uchun o'zgarish shu yerda to'xtaydi.
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

/** Auth endpoint'lari qaytaradigan token juftligi. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
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
