import type { ApiListQuery } from './api';

/**
 * Freelancer arizalari va freelancerlar — haqiqiy backend
 * (`/admin/freelance/...`).
 */

export const REQUEST_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlangan',
  rejected: 'Rad etilgan',
};

export const FREELANCER_STATUSES = ['none', 'pending', 'active', 'suspended', 'rejected'] as const;
export type FreelancerStatus = (typeof FREELANCER_STATUSES)[number];

export const FREELANCER_STATUS_LABELS: Record<FreelancerStatus, string> = {
  none: 'Yo‘q',
  pending: 'Kutilmoqda',
  active: 'Faol',
  suspended: 'To‘xtatilgan',
  rejected: 'Rad etilgan',
};

export const WORK_DIRECTIONS = [
  'subject',
  'programming',
  'coursework',
  'independent',
  'diploma',
  'lab',
  'drawing',
  'translation',
  'content',
  'other',
] as const;
export type WorkDirection = (typeof WORK_DIRECTIONS)[number];

export const WORK_DIRECTION_LABELS: Record<WorkDirection, string> = {
  subject: 'Fanlar',
  programming: 'Dasturlash',
  coursework: 'Kurs ishlari',
  independent: 'Mustaqil ishlar',
  diploma: 'Diplom ishlari',
  lab: 'Laboratoriya ishlari',
  drawing: 'Chizmachilik',
  translation: 'Tarjima',
  content: 'Matn va kontent',
  other: 'Boshqa',
};

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'professional', 'expert'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  professional: 'Professional',
  expert: 'Ekspert',
};

export const AVAILABILITIES = ['available', 'busy'] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available: "Bo'sh",
  busy: 'Band',
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: 'Pasport',
  id_card: 'ID karta',
};

export interface AdminFreelancerApplication {
  id: string;
  user: string;
  first_name: string;
  last_name: string;
  full_name: string;
  contact_phone: string;
  telegram: string;
  document_type: string;
  passport_series: string;
  passport_number: string;
  id_card_number: string;
  document_file: string | null;
  city: string;
  university: string;
  faculty: string;
  course: number | null;
  major: string;
  about: string;
  motivation: string;
  availability_note: string;
  direction: WorkDirection;
  experience_level: ExperienceLevel;
  skills: string[];
  portfolio_url: string;
  data_confirmed: boolean;
  documents_confirmed: boolean;
  rules_accepted: boolean;
  status: RequestStatus;
  freelancer_status: FreelancerStatus;
  reject_reason: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminFreelancer {
  id: string;
  user: string;
  status: FreelancerStatus;
  direction: WorkDirection;
  experience_level: ExperienceLevel;
  skills: string[];
  bio: string;
  city: string;
  telegram: string;
  portfolio_url: string;
  price_from: string | null;
  availability: Availability;
  rating: string;
  completed_jobs: number;
  active_jobs: number;
  total_earn: string;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
}

export interface FreelancerStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  rejected: number;
}

interface FreelanceFilters extends ApiListQuery {
  direction?: WorkDirection;
  experience_level?: ExperienceLevel;
  city?: string;
}

export interface ApplicationsQuery extends FreelanceFilters {
  status?: RequestStatus;
}

/**
 * Freelancer holati ariza holatidan FARQ QILADI: arizada
 * pending/approved/rejected, freelancerda esa `suspended` va `none` ham
 * bor. Shuning uchun `FreelancersQuery` `ApplicationsQuery` dan meros
 * olmaydi — olganda `suspended` bo'yicha filtrlash tip xatosi berardi.
 */
export interface FreelancersQuery extends FreelanceFilters {
  status?: FreelancerStatus;
  availability?: Availability;
}
