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
  /**
   * Telefon raqam yoki tasdiqlangan email — backend «@» belgisiga qarab
   * o'zi ajratadi. Panel xodimi hisobi saytdagi hisobning o'zi, ya'ni u
   * qaysi usul bilan ochilgan bo'lsa, shu bilan kiradi.
   */
  identifier: string;
  password: string;
}

export interface ChangePasswordRequest {
  /**
   * Paroli YO'Q hisob uchun yuborilmaydi (Google yoki SMS kodi orqali
   * ochilgani). Bunday hisobdan eski parolni so'rash javobi yo'q savol.
   */
  old_password?: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface ForgotPasswordConfirmRequest {
  identifier: string;
  code: string;
  new_password: string;
}

/** Kod yuborildi. `demo_code` faqat yetkazish o'chiq bo'lganda keladi. */
export interface CodeSentResponse {
  detail: string;
  demo_code?: string;
}

/** `/me/login-methods/` — bu yerda faqat «paroli bormi» kerak. */
export interface LoginMethodsResponse {
  has_password: boolean;
}

export interface AuthResponse {
  user: CurrentUser;
  tokens: TokenPair;
}
