import type { ApiListQuery } from './api';
import type { RequestStatus } from './adminFreelance';

/**
 * Foydalanuvchi arizalari va shikoyatlar — haqiqiy backend.
 * Uchala bo'lim bir xil oqim: kutilmoqda → tasdiqlash yoki rad etish.
 */

export interface AdminSubjectRequest {
  id: string;
  /** Backend to'liq obyekt qaytaradi, faqat ID emas. */
  user: Requester;
  university: string;
  university_name: string;
  university_short_name: string;
  name: string;
  course: number | null;
  semester: number | null;
  /** Arizachining o'z izohi — moderator uchun kontekst. */
  note: string;
  status: RequestStatus;
  reject_reason: string;
  reviewed_by: Requester | null;
  /** Ko'rib chiqilgan payt. Hali ko'rilmagan arizada `null`. */
  reviewed_at: string | null;
  /** Tasdiqlangach yaratilgan fan. */
  created_subject: string | null;
  reward_granted: boolean;
  created_at: string;
  updated_at: string;
}

/** Arizachi va ko'rib chiqqan admin bir xil shaklda keladi. */
export interface Requester {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  status: string;
}

export interface AdminUniversityRequest {
  id: string;
  user: Requester | null;
  requester_phone: string;
  name: string;
  short_name: string;
  city: string;
  comment: string;
  status: RequestStatus;
  reject_reason: string;
  reviewed_by: Requester | null;
  /** Tasdiqlangach yaratilgan universitet. */
  created_university: string | null;
  reward_granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAssignmentRequest {
  id: string;
  /** Backend to'liq obyekt qaytaradi, faqat ID emas. */
  user: Requester;
  subject: string;
  subject_name: string;
  university: string;
  university_name: string;
  title: string;
  /** `independent` | `practical` | `laboratory` | `course_work` | `other`. */
  type: string;
  description: string;
  file: string | null;
  variant_count: number | null;
  status: RequestStatus;
  reject_reason: string;
  reviewed_by: Requester | null;
  /** Qaror qachon qabul qilingan. `updated_at` bu savolga javob bermaydi. */
  reviewed_at: string | null;
  created_assignment: string | null;
  reward_granted: boolean;
  created_at: string;
  updated_at: string;
}

export const REPORT_REASONS = [
  'copyright',
  'inappropriate',
  'low_quality',
  'wrong_content',
  'spam',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  copyright: 'Mualliflik huquqi',
  inappropriate: 'Nomaqbul kontent',
  low_quality: 'Past sifat',
  wrong_content: 'Mos kelmaydigan kontent',
  spam: 'Spam',
  other: 'Boshqa',
};

export interface AdminSolutionReport {
  id: string;
  solution: string;
  solution_title: string;
  solution_status: string;
  user: string;
  reason: ReportReason;
  description: string;
  status: RequestStatus;
  resolution_note: string;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestsQuery extends ApiListQuery {
  status?: RequestStatus;
}

export interface UniversityRequestsQuery extends RequestsQuery {
  city?: string;
}

export interface SubjectRequestsQuery extends RequestsQuery {
  university?: string;
}

export interface AssignmentRequestsQuery extends RequestsQuery {
  subject?: string;
}

export interface ReportsQuery extends RequestsQuery {
  reason?: ReportReason;
  solution?: string;
}

export const REQUEST_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Barcha holatlar' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'approved', label: 'Tasdiqlangan' },
  { value: 'rejected', label: 'Rad etilgan' },
];
