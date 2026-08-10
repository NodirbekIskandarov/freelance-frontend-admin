import type { Pagination } from './api';

export type InstituteStatus = 'Faol' | 'Kutilmoqda' | 'Bloklangan';

/** 7-rasmdagi jadval qatori. */
export interface Institute {
  id: string;
  name: string;
  short: string;
  region: string;
  logoUrl?: string | null;
  subjectCount: number;
  taskCount: number;
  variantCount: number;
  status: InstituteStatus;
  addedAt: string;
}

export type InstituteRequestStatus = 'Kutilmoqda' | 'Tasdiqlangan' | 'Rad etilgan';

/** 8-rasmdagi jadval qatori. */
export interface InstituteRequest {
  id: string;
  name: string;
  short: string;
  region: string;
  requester: { name: string; username: string; avatarUrl?: string | null };
  phone: string;
  /** Sana va vaqt alohida — dizaynda ular ikki qatorda. */
  date: string;
  time: string;
  status: InstituteRequestStatus;
  comment: string;
}

export interface InstitutesListQuery {
  page: number;
  limit: number;
  search?: string;
  region?: string;
  status?: string;
}

export interface InstitutesListResponse {
  items: Institute[];
  pagination: Pagination;
  regions: string[];
}

export interface InstituteRequestsListResponse {
  items: InstituteRequest[];
  pagination: Pagination;
  regions: string[];
}
