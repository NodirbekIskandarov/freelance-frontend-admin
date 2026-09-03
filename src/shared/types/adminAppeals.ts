/**
 * Foydalanuvchi murojaatlari — admin tomoni (`/api/v1/admin/appeals/`).
 *
 * Web tomonida foydalanuvchi murojaat yozadi, bu yerda admin uni oladi
 * (`take/`) va javob beradi (`reply/`). Uchinchi amal yo'q: murojaat
 * javob berilishi bilan `resolved` bo'ladi.
 */

export const APPEAL_TOPICS = [
  'payment',
  'solution',
  'account',
  'freelance',
  'suggestion',
  'other',
] as const;
export type AppealTopic = (typeof APPEAL_TOPICS)[number];

export const APPEAL_TOPIC_LABELS: Record<AppealTopic, string> = {
  payment: "To'lov",
  solution: 'Yechim',
  account: 'Hisob',
  freelance: 'Freelance',
  suggestion: 'Taklif',
  other: 'Boshqa',
};

export const APPEAL_STATUSES = ['open', 'in_review', 'resolved'] as const;
export type AppealStatus = (typeof APPEAL_STATUSES)[number];

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  open: 'Yangi',
  in_review: "Ko'rib chiqilmoqda",
  resolved: 'Hal qilindi',
};

/** Murojaat egasi va javob bergan admin bir xil shaklda keladi. */
export interface AppealAuthor {
  id: string;
  phone: string;
  email: string;
  full_name: string;
}

/** Foydalanuvchi murojaatga biriktirgan skrinshot yoki fayl. */
export interface AppealAttachment {
  id: string;
  file: string;
  created_at: string;
}

export interface AdminAppeal {
  id: string;
  reference: string;
  topic: AppealTopic;
  subject: string;
  message: string;
  status: AppealStatus;
  reply: string | null;
  replied_at: string | null;
  replied_by: AppealAuthor | null;
  user: AppealAuthor;
  /**
   * Murojaatga ilova qilingan fayllar.
   *
   * Aynan shu narsa operator eng ko'p so'raydigan narsa edi
   * («skrinshotini yuboring»), shuning uchun u javob oynasida
   * matnning YONIDA turadi — alohida sahifada emas.
   */
  attachments: AppealAttachment[];
  created_at: string;
  updated_at: string;
}

export interface AppealStats {
  total: number;
  open: number;
  in_review: number;
  resolved: number;
}

export interface AppealsQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  status?: AppealStatus;
  topic?: AppealTopic;
}
