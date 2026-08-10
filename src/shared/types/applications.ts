import type { Pagination } from './api';

export type ApplicationStatus = 'Kutilmoqda' | 'Tasdiqlangan' | 'Rad etilgan';

export interface AttachedFile {
  name: string;
  /** Katakdagi kichik yorliq: PDF, JPG, DOCX... */
  format: string;
  url?: string | null;
}

/** 4-rasmdagi jadval qatori. */
export interface FreelancerApplication {
  id: string;
  displayId: string;
  userName: string;
  userAvatarUrl?: string | null;
  phone: string;
  university: string;
  speciality: string;
  document: AttachedFile;
  portfolioCount: number;
  status: ApplicationStatus;
}

export interface ApplicationsStats {
  total: number;
  totalPercent: string;
  pending: number;
  pendingPercent: string;
  approved: number;
  approvedPercent: string;
  rejected: number;
  rejectedPercent: string;
}

export interface ApplicationsListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: ApplicationStatus | 'all';
  university?: string;
  speciality?: string;
}

export interface ApplicationsListResponse {
  items: FreelancerApplication[];
  pagination: Pagination;
  stats: ApplicationsStats;
  filters: {
    universities: string[];
    specialities: string[];
  };
}
