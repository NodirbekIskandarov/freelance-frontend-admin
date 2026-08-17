import type { ApiListQuery } from './api';

/**
 * Katalog ma'lumotnomasi — haqiqiy backend.
 *
 * Ierarxiya: universitet → fakultet → yo'nalish → fan → topshiriq →
 * variant. Fakultet va yo'nalish FAQAT O'QISH uchun (`GET`) — ular
 * backend tomonidan boshqariladi va admin panelda tanlov ro'yxati
 * sifatida ishlatiladi.
 */

export interface University {
  id: string;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  short_name: string;
  /** Berilmasa `short_name` dan avtomatik yasaladi. */
  code: string;
  city: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UniversityWriteRequest {
  name: string;
  name_ru?: string;
  short_name?: string;
  code?: string;
  city?: string;
  is_active?: boolean;
}

export interface Faculty {
  id: string;
  university: string;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  is_active: boolean;
}

export interface Direction {
  id: string;
  faculty: string;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  code: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  university: string;
  university_name: string;
  direction: string | null;
  direction_name: string;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  course: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubjectWriteRequest {
  university: string;
  name: string;
  /** Ixtiyoriy, lekin berilsa O'SHA universitetga tegishli bo'lishi shart. */
  direction?: string | null;
  name_ru?: string;
  course?: number | null;
  is_active?: boolean;
}

export interface UniversitiesQuery extends ApiListQuery {
  city?: string;
  is_active?: boolean;
}

export interface SubjectsQuery extends ApiListQuery {
  university?: string;
  direction?: string;
  course?: number;
  is_active?: boolean;
}

export const CATALOGUE_ORDERING_OPTIONS = [
  { value: 'name', label: 'Nomi (A–Z)' },
  { value: '-name', label: 'Nomi (Z–A)' },
  { value: '-created_at', label: 'Avval yangilari' },
  { value: 'created_at', label: 'Avval eskilari' },
] as const;
