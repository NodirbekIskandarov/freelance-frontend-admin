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

/**
 * Amal kodidan O'ZBEKCHA yorliqqa.
 *
 * Backend `action_display` ni ham qaytaradi, lekin u ingliz tilida
 * (`Section updated`) yoki umuman kodning o'zi (`assignment_created`)
 * bo'lib chiqadi. Panelda ishlayotgan odam uchun bu ikkalasi ham begona:
 * jurnalning butun ma'nosi — «kim nima qilgani» ni O'QIB tushunish.
 *
 * Ro'yxatda yo'q kod uchun `auditActionLabel` kodning o'zini emas,
 * uni o'qiladigan holga keltirilgan ko'rinishini qaytaradi.
 */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  university_created: 'Institut qo‘shildi',
  university_updated: 'Institut tahrirlandi',
  university_deleted: 'Institut o‘chirildi',
  subject_created: 'Fan qo‘shildi',
  subject_updated: 'Fan tahrirlandi',
  subject_deleted: 'Fan o‘chirildi',
  assignment_created: 'Topshiriq qo‘shildi',
  assignment_updated: 'Topshiriq tahrirlandi',
  assignment_deleted: 'Topshiriq o‘chirildi',
  variant_created: 'Variant qo‘shildi',
  variant_updated: 'Variant tahrirlandi',
  variant_deleted: 'Variant o‘chirildi',

  university_request_approved: 'Institut arizasi tasdiqlandi',
  university_request_rejected: 'Institut arizasi rad etildi',
  subject_request_approved: 'Fan arizasi tasdiqlandi',
  subject_request_rejected: 'Fan arizasi rad etildi',
  assignment_request_approved: 'Topshiriq arizasi tasdiqlandi',
  assignment_request_rejected: 'Topshiriq arizasi rad etildi',

  solution_approved: 'Yechim tasdiqlandi',
  solution_rejected: 'Yechim rad etildi',
  solution_published: 'Yechim sotuvga chiqarildi',
  solution_archived: 'Yechim arxivlandi',
  report_approved: 'Shikoyat qanoatlantirildi',
  report_rejected: 'Shikoyat rad etildi',

  application_approved: 'Freelancer arizasi tasdiqlandi',
  application_rejected: 'Freelancer arizasi rad etildi',
  freelancer_suspended: 'Freelancer to‘xtatildi',
  freelancer_reinstated: 'Freelancer tiklandi',
  task_refunded: 'Vazifa puli qaytarildi',

  wallet_adjusted: 'Hamyon tuzatildi',
  wallet_frozen: 'Hamyon muzlatildi',
  wallet_unfrozen: 'Hamyon muzlatishdan chiqarildi',
  withdrawal_paid: 'Pul yechish to‘landi',
  withdrawal_rejected: 'Pul yechish rad etildi',

  appeal_taken: 'Murojaat olindi',
  appeal_answered: 'Murojaatga javob berildi',
};

/** Noma'lum kod ham o'qiladigan bo'lsin: `some_action` → `Some action`. */
export function auditActionLabel(action: string, fallback?: string): string {
  const known = AUDIT_ACTION_LABELS[action];
  if (known) return known;
  if (fallback && !/^[a-z0-9_]+$/.test(fallback)) return fallback;

  const words = action.replace(/_/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : action;
}

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
