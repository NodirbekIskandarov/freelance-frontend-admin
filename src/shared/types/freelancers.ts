import type { Pagination } from './api';

export type FreelancerStatus = 'Faol' | 'Vaqtinchalik bloklangan' | 'Bloklangan';

/** 3-rasmdagi jadval qatori. */
export interface Freelancer {
  id: string;
  displayId: string;
  name: string;
  avatarUrl?: string | null;
  phone: string;
  speciality: string;
  institute: string;
  /** Pasport/ID skani. Yo'q bo'lsa UI joy egallovchi ko'rsatadi. */
  documentUrl?: string | null;
  rating: number;
  ratingCount: number;
  completedJobs: number;
  income: number;
  status: FreelancerStatus;
}

export interface FreelancersStats {
  total: number;
  totalDeltaThisMonth: number;
  active: number;
  activePercent: string;
  temporarilyBlocked: number;
  temporarilyBlockedPercent: string;
  blocked: number;
  blockedPercent: string;
}

export interface FreelancersListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: FreelancerStatus | 'all';
  speciality?: string;
  institute?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FreelancersListResponse {
  items: Freelancer[];
  pagination: Pagination;
  stats: FreelancersStats;
  /** Filtr select'larini to'ldirish uchun. */
  filters: {
    specialities: string[];
    institutes: string[];
  };
}
