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
  /** Yuklangan logotip manzili. Bo'lmasa bosh harflar chiziladi. */
  logo: string | null;
  /** Ro'yxat ekranlari uchun backend hisoblab beradi. */
  subject_count: number;
  assignment_count: number;
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
  /** Fayl yuborilsa `FormData` ishlatiladi; `null` — logotipni olib tashlash. */
  logo?: File | null;
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

/** Fan katalogga qayerdan tushgan — ro'yxatdagi «Manba» ustuni. */
export type SubjectSource = 'admin' | 'user' | 'freelancer';

export const SUBJECT_SOURCE_LABELS: Record<SubjectSource, string> = {
  admin: 'Admin',
  user: 'Foydalanuvchi',
  freelancer: 'Freelancer',
};

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
  semester: number | null;
  description: string;
  source: SubjectSource;
  /** Ro'yxat ekranlari uchun backend hisoblab beradi. */
  assignment_count: number;
  variant_count: number;
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
  semester?: number | null;
  /** Ko'pi bilan 300 belgi — backend ham shu chegarani tekshiradi. */
  description?: string;
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
  semester?: number;
  source?: SubjectSource;
  is_active?: boolean;
}

export const COURSE_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({
  value: String(n),
  label: `${n}-kurs`,
}));

export const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  value: String(n),
  label: `${n}-semestr`,
}));

export const CATALOGUE_ORDERING_OPTIONS = [
  { value: 'name', label: 'Nomi (A–Z)' },
  { value: '-name', label: 'Nomi (Z–A)' },
  { value: '-subject_count,-assignment_count,short_name', label: "Fani ko'p" },
  { value: '-assignment_count,-subject_count,short_name', label: "Topshirig'i ko'p" },
  { value: '-solution_count,-assignment_count,short_name', label: "Yechimi ko'p" },
  { value: '-created_at', label: 'Avval yangilari' },
  { value: 'created_at', label: 'Avval eskilari' },
] as const;

/**
 * Yon paneldagi institutlar tartibi.
 *
 * Alifbo emas: panel ish qilinadigan joyni tanlash uchun va bo'sh
 * institutni tepada ushlab turish har safar pastga aylantirishga majbur
 * qilardi. Oxirgi bosqich — qisqa nom: sanoqlar teng bo'lganda (nol
 * topshiriqli o'nlab institut) tartib aniqlanmagan bo'lib qolardi va
 * sahifalash orasida qator takrorlanishi mumkin edi.
 */
export const UNIVERSITY_PANEL_ORDERING = {
  /** Topshiriqlar ekrani uchun — topshirig'i ko'pi tepada. */
  byAssignments: '-assignment_count,-subject_count,short_name',
  /** Fanlar ekrani uchun — fani ko'pi tepada. */
  bySubjects: '-subject_count,-assignment_count,short_name',
} as const;
