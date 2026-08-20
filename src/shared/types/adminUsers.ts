import type { ApiListQuery } from './api';
import type { UserStatus } from './auth';

/**
 * Admin foydalanuvchilar ro'yxati — haqiqiy backend (`/admin/users/`).
 *
 * `is_staff` — panelga kirish huquqi. Rollar aynan shu odamlarga
 * beriladi (`PUT /admin/staff/{id}/roles/`).
 */
export interface AdminUserAccount {
  id: string;
  phone: string | null;
  email: string;
  full_name: string;
  status: UserStatus;
  phone_verified: boolean;
  email_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  last_login_at: string | null;
  created_at: string;
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  pending: 'Kutilmoqda',
  active: 'Faol',
  blocked: 'Bloklangan',
  deleted: "O'chirilgan",
};

export interface AdminUsersQuery extends ApiListQuery {
  status?: UserStatus;
  is_active?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
}

/** `PATCH /admin/users/{id}/block/` tanasi — sabab ixtiyoriy. */
export interface BlockUserRequest {
  reason?: string;
}

export const USER_ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Avval yangilari' },
  { value: 'created_at', label: 'Avval eskilari' },
  { value: '-last_login_at', label: 'Oxirgi kirish' },
  { value: 'full_name', label: 'Ism (A–Z)' },
] as const;
