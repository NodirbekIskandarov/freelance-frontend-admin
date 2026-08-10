/** 16–18-rasmlar — Yuborilgan javoblar. */

/** Chap paneldagi institut qatori (17, 18-rasm). */
export interface SubmissionInstitute {
  id: string;
  short: string;
  count: number;
  /** "Barchasi" qatori — u institut emas, umumiy ko'rinish. */
  isAll?: boolean;
  /** "Boshqa institutlar" yig'ma qatori. */
  isOther?: boolean;
}

/** 18-rasmdagi jadval qatori. */
export interface TodaySubmission {
  id: string;
  taskName: string;
  taskType: string;
  institute: string;
  subject: string;
  course: string;
  variant: string;
  sender: { name: string; username: string; avatarUrl?: string | null };
  time: string;
}

export interface TodaySubmissionsResponse {
  institutes: SubmissionInstitute[];
  items: TodaySubmission[];
  total: number;
  /** "Yana N tasini ko'rish" tugmasi uchun. */
  remaining: number;
}

/** 17-rasmdagi jadval qatori. */
export interface InstituteSubjectSubmissions {
  id: string;
  name: string;
  course: string;
  submitted: number;
  approved: number;
  reviewing: number;
  rejected: number;
}

export interface InstituteSubmissionsResponse {
  institutes: SubmissionInstitute[];
  instituteShort: string;
  totalSubjects: number;
  items: InstituteSubjectSubmissions[];
}

/** 16-rasm — chap paneldagi topshiriq. */
export interface SubmissionTask {
  id: string;
  title: string;
  answerCount: number;
}

export interface SubmissionVariant {
  id: string;
  label: string;
  answerCount: number;
}

export type AnswerStatus = 'Yangi' | 'Tasdiqlangan' | 'Arxivlangan';

/** 16-rasmdagi javoblar jadvali qatori. */
export interface SubmittedAnswer {
  id: string;
  submittedAt: string;
  sender: { username: string; role: string; avatarUrl?: string | null };
  fileName: string;
  size: string;
  comment: string;
  status: AnswerStatus;
}

export interface SubmissionDetailResponse {
  subjectName: string;
  instituteShort: string;
  totalTasks: number;
  tasks: SubmissionTask[];

  current: {
    title: string;
    type: string;
    course: string;
    subject: string;
    uploadedAt: string;
    uploader: string;
    fileName: string;
    pageCount: number;
    /** Hujjat matni — haqiqiy PDF yo'qligi uchun ko'rinish uchun. */
    previewLines: string[];
  };

  variants: SubmissionVariant[];
  selectedVariant: string;
  answers: SubmittedAnswer[];
}
