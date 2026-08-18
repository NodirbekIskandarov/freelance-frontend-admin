import type { WorkDirection } from './adminFreelance';

/**
 * Freelance birjasi — admin nazorati (`/api/v1/admin/freelance/tasks/`).
 *
 * Admin uchun yagona yozuv amali — `refund/`: kelishmovchilik chiqqanda
 * kafolatdagi pulni mijozga qaytarish. Topshiriqni tahrirlash yoki
 * yakunlash tomonlarning o'zida qoladi.
 */

export const TASK_STATUSES = [
  'open',
  'in_progress',
  'delivered',
  'completed',
  'cancelled',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Ochiq',
  in_progress: 'Bajarilmoqda',
  delivered: 'Topshirildi',
  completed: 'Yakunlandi',
  cancelled: 'Bekor qilindi',
};

export const OFFER_STATUSES = ['pending', 'accepted', 'declined', 'withdrawn'] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: 'Kutilmoqda',
  accepted: 'Qabul qilindi',
  declined: 'Rad etildi',
  withdrawn: 'Qaytarib olindi',
};

/** Topshiriq tomoni — mijoz yoki bajaruvchi. */
export interface Party {
  id: string;
  full_name: string;
}

/**
 * Admin ro'yxati ham TAFSILOT shaklini qaytaradi (fayl va komissiya
 * bilan) — moderatsiya uchun har qatorda pul raqamlari kerak.
 */
export interface AdminTask {
  id: string;
  reference: string;
  title: string;
  direction: WorkDirection;
  direction_display: string;
  description: string;
  deadline_days: number;
  budget: string | null;
  status: TaskStatus;
  offer_count: number;
  client: Party | null;
  freelancer: Party | null;
  agreed_price: string | null;
  agreed_deadline_days: number | null;
  started_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string;
  created_at: string;
  task_file: string | null;
  delivery_file: string | null;
  delivery_note: string;
  commission_percent: string | null;
  commission_amount: string | null;
  freelancer_earning: string | null;
}

export interface AdminOffer {
  id: string;
  task: string;
  freelancer: Party;
  freelancer_rating: string;
  freelancer_completed_jobs: number;
  message: string;
  price: string;
  deadline_days: number;
  status: OfferStatus;
  created_at: string;
}

export interface TaskStats {
  total: number;
  open: number;
  in_progress: number;
  delivered: number;
  completed: number;
  cancelled: number;
  /** Hozir kafolatda ushlab turilgan umumiy summa. */
  escrow_held: string;
  commission_earned: string;
}

export interface AdminTasksQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  status?: TaskStatus;
  direction?: WorkDirection;
}
