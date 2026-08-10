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
  if (!isApiErrorBody(error.data)) return null;
  return error.data.errors ?? null;
}
