import type { BadgeTone } from '@/components/ui/Badge';

/**
 * Backend holatidan badge ohangiga — BUTUN panel uchun bitta joy.
 *
 * Ilgari har sahifa o'z jadvalini tutardi va bir xil ma'no turli joyda
 * turli rangda chiqardi: `pending` bir yerda sariq, boshqasida ko'k;
 * `delivered` esa binafsha edi va binafsha hech qanday ma'noni
 * anglatmasdi.
 *
 * Qoida oddiy:
 *   success — ish tugadi, hammasi joyida
 *   warning — kimningdir harakati kutilmoqda
 *   danger  — rad etildi, bloklandi, bekor qilindi
 *   info    — jarayonda, hali qaror yo'q
 *   neutral — holatsiz yoki arxiv
 */
const TONES: Record<string, BadgeTone> = {
  // --- tugagan / tasdiqlangan ---
  active: 'success',
  approved: 'success',
  published: 'success',
  completed: 'success',
  resolved: 'success',
  paid: 'success',
  succeeded: 'success',
  available: 'success',
  verified: 'success',

  // --- kutmoqda ---
  pending: 'warning',
  waiting: 'warning',
  requested: 'warning',
  on_hold: 'warning',
  suspended: 'warning',
  processing: 'warning',

  // --- jarayonda ---
  open: 'info',
  in_review: 'info',
  in_progress: 'info',
  reviewing: 'info',
  submitted: 'info',
  new: 'info',
  delivered: 'primary',

  // --- rad / to'xtatilgan ---
  rejected: 'danger',
  blocked: 'danger',
  cancelled: 'danger',
  canceled: 'danger',
  failed: 'danger',
  refunded: 'danger',
  expired: 'danger',

  // --- holatsiz ---
  archived: 'neutral',
  draft: 'neutral',
  inactive: 'neutral',
  none: 'neutral',
  closed: 'neutral',
  busy: 'neutral',
};

/** Noma'lum holat — neytral. Rangni taxmin qilishdan ko'ra rangsiz qolgani yaxshi. */
export function statusTone(status: string | null | undefined): BadgeTone {
  if (!status) return 'neutral';
  return TONES[status.toLowerCase()] ?? 'neutral';
}
