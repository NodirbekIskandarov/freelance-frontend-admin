import type { ApiListQuery } from './api';
import type { RequestStatus } from './adminFreelance';

/**
 * Foydalanuvchi arizalari va shikoyatlar — haqiqiy backend.
 * Uchala bo'lim bir xil oqim: kutilmoqda → tasdiqlash yoki rad etish.
 */

export interface AdminSubjectRequest {
  id: string;
  user: string;
  university: string;
  university_name: string;
  university_short_name: string;
  name: string;
  course: number | null;
  status: RequestStatus;
  reject_reason: string;
  reviewed_by: string | null;
  /** Tasdiqlangach yaratilgan fan. */
  created_subject: string | null;
  reward_granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAssignmentRequest {
  id: string;
  user: string;
  subject: string;
  subject_name: string;
  university: string;
  university_name: string;
  title: string;
  description: string;
  file: string | null;
  variant_count: number | null;
  status: RequestStatus;
  reject_reason: string;
  reviewed_by: string | null;
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
