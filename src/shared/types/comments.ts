import type { ApiListQuery } from './api';

/**
 * Topshiriq izohlari — moderatsiya ro'yxati.
 *
 * Izoh darrov saytda ko'rinadi; admin uni faqat olib tashlaydi.
 * Tasdiqlash bosqichi ataylab yo'q: moderator yetgunicha to'ladigan
 * mavzu suhbat bo'lishdan to'xtaydi.
 */
export interface AdminComment {
  id: string;
  assignment: string;
  assignment_title: string;
  subject_name: string;
  university_name: string;
  author: {
    id: string;
    /** Telefon raqami yo'q: mavzu ochiq va uni yoniga qo'yish e'lon qilardi. */
    full_name: string;
  };
  body: string;
  is_mine: boolean;
  created_at: string;
}

export interface CommentsQuery extends ApiListQuery {
  assignment?: string;
  assignment__subject?: string;
  assignment__subject__university?: string;
  author?: string;
}
