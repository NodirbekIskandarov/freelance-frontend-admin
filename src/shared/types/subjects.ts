import type { Pagination } from './api';

/** Chapdagi institutlar panelidagi element (10-rasm). */
export interface InstituteSummary {
  id: string;
  short: string;
  name: string;
  logoUrl?: string | null;
  subjectCount: number;
  taskCount: number;
}

/** Fanning kim tomonidan qo'shilgani. Badge rangi shunga bog'liq. */
export type SubjectSource = 'Admin' | 'Foydalanuvchi' | 'Freelancer';

/** 10-rasmdagi jadval qatori. */
export interface Subject {
  id: string;
  name: string;
  course: string;
  taskCount: number;
  variantCount: number;
  addedAt: string;
  source: SubjectSource;
}

export interface SubjectsListResponse {
  institute: InstituteSummary;
  items: Subject[];
  pagination: Pagination;
  courses: string[];
}

export interface InstitutesPanelResponse {
  items: InstituteSummary[];
  pagination: Pagination;
}

export type SubjectRequestStatus = 'Kutilmoqda' | 'Tasdiqlashda' | 'Tasdiqlangan' | 'Rad etilgan';

export type RequesterRole = 'Talaba' | 'Freelancer';

/** 11-rasmdagi jadval qatori. */
export interface SubjectRequest {
  id: string;
  name: string;
  code: string;
  institute: { short: string; name: string; logoUrl?: string | null };
  summary: string;
  course: string;
  requester: { name: string; role: RequesterRole; avatarUrl?: string | null };
  date: string;
  time: string;
  status: SubjectRequestStatus;
}

export interface SubjectRequestsListQuery {
  page: number;
  limit: number;
  search?: string;
  institute?: string;
  status?: string;
  /** Tab'lar: barchasi / kutilayotgan / rad etilgan. */
  tab?: 'all' | 'pending' | 'rejected';
}

export interface SubjectRequestsListResponse {
  items: SubjectRequest[];
  pagination: Pagination;
  institutes: string[];
}
