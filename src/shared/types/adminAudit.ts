/**
 * Audit jurnali — HAQIQIY backend (`/admin/audit/`).
 *
 * Faqat O'QISH uchun: admin qilgan har bir amal shu yerga yoziladi.
 * Amal nomi backenddan `action_display` bilan keladi, shuning uchun
 * frontendda 35 ta yorliqni takrorlash shart emas — faqat filtr
 * ro'yxati uchun kalitlar kerak.
 */

export const AUDIT_ACTIONS = [
  'university_created',
  'university_updated',
  'university_deleted',
  'university_request_approved',
  'university_request_rejected',
  'subject_created',
  'subject_updated',
  'subject_deleted',
  'subject_request_approved',
  'subject_request_rejected',
  'assignment_created',
  'assignment_updated',
  'assignment_deleted',
  'assignment_request_approved',
  'assignment_request_rejected',
  'variant_created',
  'variant_updated',
  'variant_deleted',
  'solution_approved',
  'solution_rejected',
  'solution_published',
  'solution_archived',
  'report_approved',
  'report_rejected',
  'application_approved',
  'application_rejected',
  'freelancer_suspended',
  'freelancer_reinstated',
  'task_refunded',
  'appeal_taken',
  'appeal_answered',
  'wallet_adjusted',
  'wallet_frozen',
  'wallet_unfrozen',
  'withdrawal_paid',
  'withdrawal_rejected',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

/** Filtrda guruhlash uchun — har guruh o'z rangida ko'rsatiladi. */
export const AUDIT_ACTION_GROUPS: { label: string; actions: AuditAction[] }[] = [
  {
    label: 'Katalog',
    actions: [
      'university_created',
      'university_updated',
      'university_deleted',
      'subject_created',
      'subject_updated',
      'subject_deleted',
      'assignment_created',
      'assignment_updated',
      'assignment_deleted',
      'variant_created',
      'variant_updated',
      'variant_deleted',
    ],
  },
  {
    label: 'Arizalar',
    actions: [
      'university_request_approved',
      'university_request_rejected',
      'subject_request_approved',
      'subject_request_rejected',
      'assignment_request_approved',
      'assignment_request_rejected',
    ],
  },
  {
    label: 'Yechimlar',
    actions: [
      'solution_approved',
      'solution_rejected',
      'solution_published',
      'solution_archived',
      'report_approved',
      'report_rejected',
    ],
  },
  {
    label: 'Freelance',
    actions: [
      'application_approved',
      'application_rejected',
      'freelancer_suspended',
      'freelancer_reinstated',
      'task_refunded',
    ],
  },
  {
    label: 'Moliya',
    actions: [
      'wallet_adjusted',
      'wallet_frozen',
      'wallet_unfrozen',
      'withdrawal_paid',
      'withdrawal_rejected',
    ],
  },
  { label: 'Murojaatlar', actions: ['appeal_taken', 'appeal_answered'] },
];

export interface AuditLog {
  id: string;
  action: AuditAction;
  action_display: string;
  actor: string | null;
  actor_label: string;
  target_type: string;
  target_id: string;
  target_label: string;
  reason: string;
  /** Nima o'zgargani — shakli amalga qarab farq qiladi. */
  changes: unknown;
  ip_address: string | null;
  created_at: string;
}

export interface AuditQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  action?: AuditAction;
  actor?: string;
  target_type?: string;
  target_id?: string;
  created_after?: string;
  created_before?: string;
}
