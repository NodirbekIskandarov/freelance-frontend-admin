import type { TokenPair } from './api';

/**
 * Haqiqiy backend shakli — `https://api.yopamiz.uz/api/schema/`
 * dagi `CurrentUser` va `AuthResponse`.
 */

export const USER_STATUSES = ['pending', 'active', 'blocked', 'deleted'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AUTH_PROVIDERS = ['password', 'phone', 'google'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

/**
 * Faqat adminga kerak bo'lgan maydonlar. Sxemadagi `profile` va
 * `freelancer_profile` bu yerda ochilmagan — admin panel ularni
 * ishlatmaydi, kerak bo'lganda qo'shiladi.
 */
export interface CurrentUser {
  id: string;
  phone: string | null;
  email: string;
  auth_provider: AuthProvider;
  status: UserStatus;
  phone_verified: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  is_seller: boolean;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: CurrentUser;
  tokens: TokenPair;
}
