/**
 * Yechim moderatsiyasi — Swagger'dagi "Solution Moderation" bo'limi.
 * Shakl `https://api.yopamiz.uz/api/schema/` dagi `Solution` sxemasidan
 * bir-bir olingan, shu sababli maydon nomlari snake_case.
 */

export const SOLUTION_STATUSES = [
  'pending',
  'approved',
  'published',
  'rejected',
  'archived',
] as const;
export type SolutionStatus = (typeof SOLUTION_STATUSES)[number];

export const SOLUTION_STATUS_LABELS: Record<SolutionStatus, string> = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlangan',
  published: "E'lon qilingan",
  rejected: 'Rad etilgan',
  archived: 'Arxivlangan',
};

export interface Solution {
  id: string;
  variant: string;
  variant_label: string;
  uploader: string;
  title: string;
  description: string;
  /** Yuklab olinadigan fayl manzili. */
  file: string;
  /** DRF `DecimalField` — satr sifatida keladi, aniqlik yo'qolmasligi uchun. */
  price: string;
  /**
   * Yuklovchi so'ragan narx. Hech qachon o'zgarmaydi — e'lon qilishda
   * `price` ustiga yozilgandan keyin ham u qancha so'raganini bilish
   * mumkin bo'lsin.
   */
  asking_price: string;
  status: SolutionStatus;
  reject_reason: string;
  commission_percent: string | null;
  published_at: string | null;
  moderated_by: string | null;
  created_at: string;
  updated_at: string;
}

/** `POST /admin/solutions/{id}/publish/` tanasi. */
export interface SolutionPublishRequest {
  price: string;
  /** 0–100 oralig'idagi foiz. */
  commission_percent: string;
}

/** `POST /admin/solutions/{id}/reject/` tanasi. */
export interface SolutionRejectRequest {
  reason: string;
}

/**
 * Kutilayotgan yechimlar ro'yxati uchun saralash variantlari.
 *
 * Backend `ordering` uchun ruxsat etilgan maydonlar ro'yxatini sxemada
 * e'lon qilmagan, shuning uchun bu yerda faqat `Solution` da mavjud va
 * saralashga mantiqan mos keladigan maydonlar berilgan.
 */
export const SOLUTION_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Avval yangilari' },
  { value: 'created_at', label: 'Avval eskilari' },
  { value: 'title', label: 'Sarlavha (A–Z)' },
  { value: '-title', label: 'Sarlavha (Z–A)' },
] as const;
