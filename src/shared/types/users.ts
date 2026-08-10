import type { Pagination } from './api';

export type UserStatus = 'Faol' | 'Kutilmoqda' | 'Bloklangan';

/** 2-rasmdagi jadval qatori. */
export interface AdminUser {
  id: string;
  /** Ko'rinadigan raqam: `#U-12482`. */
  displayId: string;
  name: string;
  avatarUrl?: string | null;
  phone: string;
  email: string;
  registeredAt: string;
  /** So'mda, formatlash UI tomonda. */
  balance: number;
  status: UserStatus;
}

export interface UsersStats {
  total: number;
  totalDeltaThisMonth: number;
  addedToday: number;
  addedTodayDelta: number;
  active: number;
  activePercent: string;
  blocked: number;
  blockedPercent: string;
}

export interface UsersListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersListResponse {
  items: AdminUser[];
  pagination: Pagination;
  stats: UsersStats;
}
