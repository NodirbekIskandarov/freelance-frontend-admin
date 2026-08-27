import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

import type { ApiErrorBody } from '../types/api';

export type QueryError = FetchBaseQueryError | SerializedError;

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

/**
 * Backend xato matnlari inglizcha keladi, panel esa o'zbekcha.
 *
 * Faqat HAQIQATDA kuzatilgan kodlar tarjima qilinadi — qolganlari uchun
 * server matni ko'rsatiladi. Taxminiy kodlarni oldindan yozib qo'yish
 * foydasiz: ular hech qachon mos kelmasligi mumkin, lekin ro'yxatni
 * eskirgan ko'rinishga olib keladi.
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  authentication_failed: "Telefon raqam yoki parol noto'g'ri",
  not_authenticated: 'Avtorizatsiya talab qilinadi',
  permission_denied: "Bu amal uchun ruxsatingiz yo'q",
  not_found: 'Ma‘lumot topilmadi',
};

function getErrorCode(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;

  const errors = (data as Record<string, unknown>).errors;
  if (typeof errors !== 'object' || errors === null) return null;

  const code = (errors as Record<string, unknown>).code;
  return typeof code === 'string' ? code : null;
}

/** Obyekt ichidan birinchi ma'noli matnni topadi (satr yoki satrlar massivi). */
function firstMessage(body: Record<string, unknown>): string | null {
  if (typeof body.detail === 'string' && body.detail.trim() !== '') return body.detail;

  for (const value of Object.values(body)) {
    if (typeof value === 'string' && value.trim() !== '') return value;
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === 'string' && item.trim() !== '');
      if (typeof first === 'string') return first;
    }
  }

  return null;
}

/**
 * Backend xato tanasidan matn ajratadi.
 *
 * Server xatolarni konvertga o'raydi:
 *   `{"success": false, "data": null,
 *     "errors": {"detail": "Invalid phone or password.", "code": "…"}}`
 * Validatsiya xatosida `errors` ichida maydon nomlari bo'ladi:
 *   `{"errors": {"price": ["…"]}}`.
 *
 * Konvertsiz DRF shakli (`{"detail": …}`) ham qo'llab-quvvatlanadi —
 * ba'zi xatolar (masalan 404 sahifasi) middleware'gacha yetib bormaydi.
 */
function getServerErrorMessage(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;

  const body = data as Record<string, unknown>;

  if (typeof body.errors === 'object' && body.errors !== null) {
    const errors = body.errors as Record<string, unknown>;

    /*
     * Maydon xatosi UMUMIY matndan ustun.
     *
     * Validatsiya xatosida server `detail` ga «Validation failed.» yozadi
     * va haqiqiy sababni `fields` ichiga qo'yadi. `detail` ni birinchi
     * olish moderatorga hech nima aytmaydigan matn ko'rsatib, aynan
     * kerakli izohni yashirib qo'yardi.
     */
    if (typeof errors.fields === 'object' && errors.fields !== null) {
      const fromFields = firstMessage(errors.fields as Record<string, unknown>);
      if (fromFields) return fromFields;
    }

    const fromEnvelope = firstMessage(errors);
    if (fromEnvelope) return fromEnvelope;
  }

  return firstMessage(body);
}

/**
 * RTK Query xatosidan foydalanuvchiga ko'rsatiladigan matn ajratadi.
 * Xato tanasi backend'dan har xil shaklda kelishi mumkin, shuning uchun
 * bu yerda bir joyda normallashtiriladi — UI kodida `error as any` bo'lmaydi.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Nimadir xato ketdi'): string {
  if (!error) return fallback;

  if (isFetchBaseQueryError(error)) {
    if (error.status === 'FETCH_ERROR') {
      return 'Serverga ulanib bo‘lmadi. Internetni tekshiring.';
    }
    if (error.status === 'TIMEOUT_ERROR') {
      return 'Server javob bermadi. Qaytadan urinib ko‘ring.';
    }
    if (error.status === 'PARSING_ERROR') {
      return fallback;
    }
    if (isApiErrorBody(error.data)) {
      return error.data.message;
    }

    const code = getErrorCode(error.data);
    if (code && ERROR_CODE_MESSAGES[code]) return ERROR_CODE_MESSAGES[code];

    const serverMessage = getServerErrorMessage(error.data);
    if (serverMessage) return serverMessage;

    if (typeof error.data === 'string' && error.data.trim() !== '') {
      return error.data;
    }
    return fallback;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as SerializedError;
    if (typeof message === 'string' && message.trim() !== '') return message;
  }

  return fallback;
}

/**
 * Form maydonlari bo'yicha validatsiya xatolarini qaytaradi (bo'lsa).
 * Masalan: `{ email: ['Bunday email band'] }`.
 */
export function getFieldErrors(error: unknown): Record<string, string[]> | null {
  if (!isFetchBaseQueryError(error)) return null;
  if (typeof error.data !== 'object' || error.data === null) return null;

  /*
   * Maydon xatolari konvertda `errors.fields` da turadi.
   *
   * Ilgari bu yerda `isApiErrorBody` tekshirilardi — u esa `message` degan
   * satrni talab qiladi va server javobida bunday maydon YO'Q. Natijada
   * funksiya har doim `null` qaytarardi va hech bir forma maydon ostidagi
   * aniq xatoni ko'rsata olmasdi.
   */
  const errors = (error.data as Record<string, unknown>).errors;
  if (typeof errors !== 'object' || errors === null) return null;

  const fields = (errors as Record<string, unknown>).fields;
  if (typeof fields !== 'object' || fields === null) return null;

  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fields as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const messages = value.filter((item): item is string => typeof item === 'string');
      if (messages.length > 0) result[key] = messages;
    } else if (typeof value === 'string') {
      result[key] = [value];
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}
