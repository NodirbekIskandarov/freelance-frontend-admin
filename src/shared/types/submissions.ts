/**
 * Yuborilgan javoblar — HAQIQIY backend (`/admin/submissions/...`).
 *
 * Bo'lim to'rt bosqichli: institut → fan → topshiriq → variant → javoblar.
 * Har bosqichda bir xil beshta sanoq (`*_count`) keladi, shuning uchun
 * ular umumiy `SubmissionCounts` ichida.
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
  published: 'Chop etilgan',
  rejected: 'Rad etilgan',
  archived: 'Arxivlangan',
};

export interface SubmissionCounts {
  submitted_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  archived_count: number;
}

export interface SubmissionUniversity extends SubmissionCounts {
  id: string;
  name: string;
  short_name: string;
}

export interface SubmissionSubject extends SubmissionCounts {
  id: string;
  name: string;
  course: number | null;
  university: string;
  university_name: string;
}

export interface SubmissionAssignment extends SubmissionCounts {
  id: string;
  title: string;
  type: string;
  description: string;
  subject: string;
  subject_name: string;
  /** Topshiriq qavatida qabul ochiqmi — yopilsa barcha variantlari yopiladi. */
  accepts_submissions: boolean;
}

export interface SubmissionVariant extends SubmissionCounts {
  id: string;
  number: number;
  assignment: string;
  /** Nechta foydalanuvchi shu variantga yechim so'ragan. */
  request_count: number;
  /** Yangi yechim qabul qilinadimi. Topshiriq qavati ham yopishi mumkin. */
  accepts_submissions: boolean;
  /** Bu variantga nechta yechim chop etilishi mumkin. */
  max_published_solutions: number;
}

export interface SubmissionUploader {
  id: string;
  phone: string;
  full_name: string;
}

/** Yakuniy bosqich — yuklangan yechimning o'zi. */
export interface Submission {
  id: string;
  title: string;
  description: string;
  status: SolutionStatus;
  /** Joriy narx — chop etilgandan keyin admin belgilagani. */
  price: string;
  /** Yuklovchi so'ragan narx. Hech qachon o'zgarmaydi. */
  asking_price: string;
  file_name: string;
  file_url: string;
  uploader: SubmissionUploader | null;
  variant: string;
  variant_number: number;
  assignment: string;
  assignment_title: string;
  assignment_type: string;
  subject: string;
  subject_name: string;
  course: number | null;
  university: string;
  university_name: string;
  university_short_name: string;
  created_at: string;
}

interface ListQuery {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface TodaySubmissionsQuery extends ListQuery {
  status?: SolutionStatus;
  university?: string;
  variant?: string;
}

export interface SubmissionSubjectsQuery extends ListQuery {
  id: string;
}

export interface SubmissionAssignmentsQuery extends ListQuery {
  id: string;
  type?: string;
}

export interface SubmissionAnswersQuery extends ListQuery {
  id: string;
  status?: SolutionStatus;
}

/**
 * Faylni brauzerda ko'rsatib bo'ladimi.
 *
 * PDF va rasmlar — ha, brauzerning o'zi chizadi. Office hujjatlari va
 * arxivlar uchun konvertor kerak, u yo'q: ularni «ko'rib chiqish» deb
 * ko'rsatib, keyin bo'sh oyna chiqargandan ko'ra ochiq aytgan yaxshi.
 */
export type PreviewKind = 'pdf' | 'image' | 'none';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

export function previewKindOf(fileName: string): PreviewKind {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (extension === 'pdf') return 'pdf';
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
  return 'none';
}

/** Kengaytma — jadvalda fayl turini bir qarashda ko'rsatish uchun. */
export function fileExtensionOf(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  // Nuqtasiz nom bo'lsa `pop()` butun nomni qaytaradi — u kengaytma emas.
  return extension && extension !== fileName.toLowerCase() ? extension : '';
}
