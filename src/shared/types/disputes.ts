/**
 * Xarid bo'yicha shikoyatlar — `/api/v1/admin/disputes/`.
 *
 * Yechim shikoyatlari (`SolutionReport`) bilan ADASHTIRMANG: u «buni sotuvga
 * qo'yish kerak emas» deydi va uni har kim yozadi. Bu esa «men buni sotib
 * oldim va bu men olgan narsa emas» — faqat xaridor yozadi va natijasi pul
 * harakati.
 *
 * Pul maydonlari SATR: DRF `DecimalField` shunday qaytaradi va uni `number`ga
 * o'tkazib qaytarish katta summalarda aniqlikni yo'qotardi.
 */

export const DISPUTE_REASONS = [
  'not_matching',
  'broken_file',
  'differs',
  'stolen',
  'duplicate',
] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  not_matching: 'Topshiriq shartiga mos emas',
  broken_file: 'Fayl ochilmaydi / buzilgan',
  differs: "Ko'rsatilgandan farq qiladi",
  stolen: "Muallifning ishi o'g'irlangan",
  duplicate: 'Dublikat — bu allaqachon bor',
};

export const DISPUTE_STATUSES = ['pending', 'answered', 'resolved', 'rejected'] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  pending: 'Muallif javobi kutilmoqda',
  answered: 'Muallif javob berdi',
  resolved: 'Hal qilindi',
  rejected: 'Rad etildi',
};

export const DISPUTE_RESOLUTIONS = [
  'full_refund',
  'partial_refund',
  'replace',
  'dismissed',
] as const;
export type DisputeResolution = (typeof DISPUTE_RESOLUTIONS)[number];

export const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolution, string> = {
  full_refund: "Pulni to'liq qaytarish",
  partial_refund: 'Yarmini qaytarish',
  replace: 'Tuzatilgan fayl bilan almashtirish',
  dismissed: 'Shikoyatni rad etish',
};

/** Har bir qaror nima qilishini bir qatorda tushuntiradi. */
export const DISPUTE_RESOLUTION_HINTS: Record<DisputeResolution, string> = {
  full_refund: "Xaridor haq — muallif hold'idan yechiladi",
  partial_refund: "Yechim qisman to'g'ri bo'lsa",
  replace: 'Sotuv qoladi, muallif tuzatilgan faylni yuboradi',
  dismissed: 'Asossiz — xaridorga ogohlantirish yoziladi',
};

export interface DisputeParty {
  id: string;
  phone: string;
  full_name: string;
}

export interface DisputeEvidence {
  id: string;
  file: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  order: string;
  solution: string;
  solution_title: string;
  unit_price: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  /** Muallifga javob berish uchun berilgan muddat. */
  respond_deadline: string;
  author_response: string;
  author_responded_at: string | null;
  resolution: DisputeResolution | '';
  resolution_note: string;
  refunded_amount: string;
  resolved_at: string | null;
  evidence: DisputeEvidence[];
  created_at: string;

  buyer: DisputeParty;
  seller: DisputeParty;
  resolved_by: DisputeParty | null;

  commission_amount: string;
  seller_earning: string;
  /** Muallif ulushi hali to'lanmagan — qaror qabul qilinayotgan pul. */
  earning_held: boolean;

  solution_unpublished: boolean;
  fix_requested: boolean;
  author_warned: boolean;

  /* Har ikki tomonning tarixi. Uzoq yurgan xaridorning birinchi shikoyati
     va ikkita shikoyati tasdiqlangan muallif — bu boshqa holat, ID esa bu
     haqda hech nima aytmaydi. */
  buyer_purchase_count: number;
  buyer_dispute_count: number;
  seller_solution_count: number;
  seller_dispute_count: number;
  seller_upheld_count: number;
}

export interface DisputesQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  status?: DisputeStatus;
  reason?: DisputeReason;
}

export interface DisputeStats {
  total: number;
  open: number;
  resolved: number;
  rejected: number;
  /** Xaridlarning necha foizi shikoyatga aylangani. */
  dispute_rate: string;
  average_hours: string;
  buyer_favoured_percent: string;
}

export interface DisputeResolveRequest {
  resolution: DisputeResolution;
  note?: string;
  unpublish?: boolean;
  request_fix?: boolean;
  warn_author?: boolean;
}
