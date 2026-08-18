import type { ApiListQuery } from './api';

/**
 * Topshiriqlar (assignments) va ularning variantlari — haqiqiy backend.
 *
 * Topshiriq FANga tegishli, universitet esa fandan meros — shuning
 * uchun `university` yozishga berilmaydi, serverning o'zi to'ldiradi.
 */

export interface Assignment {
  id: string;
  subject: string;
  subject_name: string;
  university: string;
  university_name: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** `POST /assignments/` va `PUT/PATCH /assignments/{id}/` tanasi. */
export interface AssignmentWriteRequest {
  subject: string;
  title: string;
  description?: string;
  is_active?: boolean;
}

export interface AssignmentsQuery extends ApiListQuery {
  subject?: string;
  is_active?: boolean;
}

export interface VariantWriteRequest {
  assignment: string;
  number: number;
  /** Bitta variantga nechta yechim e'lon qilinishi mumkinligi. */
  max_published_solutions?: number;
  is_active?: boolean;
}

export interface VariantsQuery extends ApiListQuery {
  assignment?: string;
  is_active?: boolean;
}

export const VARIANT_ORDERING_OPTIONS = [
  { value: 'number', label: "Raqami bo'yicha" },
  { value: '-number', label: 'Raqami (teskari)' },
  { value: '-request_count', label: "Ko'p so'ralganlari" },
] as const;

/** Variant — topshiriqning raqamlangan varianti. */
export interface Variant {
  id: string;
  assignment: string;
  assignment_title: string;
  subject: string;
  number: number;
  label: string;
  /** Bitta variantga nechta yechim e'lon qilinishi mumkinligi. */
  max_published_solutions: number;
  request_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Fan — topshiriq yaratishda tanlanadi. */
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

export const ASSIGNMENT_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Avval yangilari' },
  { value: 'created_at', label: 'Avval eskilari' },
  { value: 'title', label: 'Sarlavha (A–Z)' },
  { value: '-title', label: 'Sarlavha (Z–A)' },
] as const;
