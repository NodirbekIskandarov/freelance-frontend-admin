import type { Pagination } from './api';
import type { InstituteSummary } from './subjects';

/** 13-rasmdagi o'ng jadval qatori (institut ichidagi fanlar). */
export interface SubjectRow {
  id: string;
  name: string;
  code: string;
  course: number;
  semester: number;
  taskCount: number;
  status: 'Faol' | 'Kutilmoqda';
}

export interface InstituteSubjectsResponse {
  institute: InstituteSummary;
  items: SubjectRow[];
  pagination: Pagination;
  /** Filtr paneli uchun variantlar. */
  filters: {
    courses: string[];
    semesters: string[];
    taskTypes: string[];
    statuses: string[];
  };
  /** Banner'dagi qizil badge soni. */
  pendingRequestCount: number;
}

export type TaskVariantKind = 'Variantli' | 'Variantsiz';
export type TaskStatus = 'Faol' | 'Kutilyapti';

/** 14-rasmdagi jadval qatori. */
export interface Task {
  id: string;
  order: number;
  name: string;
  code: string;
  kind: TaskVariantKind;
  /** Variantsiz topshiriqda son bo'lmaydi — dizaynda "–" ko'rsatiladi. */
  variantCount: number | null;
  solvedCount: number | null;
  status: TaskStatus;
}

/** 14-rasmdagi sahifa sarlavhasi ma'lumoti. */
export interface SubjectDetail {
  id: string;
  name: string;
  code: string;
  instituteShort: string;
  instituteName: string;
  /** Tab kalitiga qarab topshiriqlar. */
  tasks: Record<string, Task[]>;
}
