/**
 * Hamyonlar va pul yechish so'rovlari — admin tomoni
 * (`/api/v1/admin/wallet/...`).
 *
 * Pul maydonlari SATR: DRF `DecimalField` shunday qaytaradi va uni
 * `number`ga o'tkazib qaytarish katta summalarda aniqlikni yo'qotardi.
 */

export interface WalletOwner {
  id: string;
  phone: string;
  email: string;
  full_name: string;
}

export interface AdminWallet {
  id: string;
  user: WalletOwner;
  balance: string;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
}

export const TRANSACTION_TYPES = [
  'topup',
  'purchase',
  'sale',
  'refund',
  'withdrawal',
  'adjustment',
  'escrow_hold',
  'escrow_release',
  'escrow_refund',
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  topup: "To'ldirish",
  purchase: 'Xarid',
  sale: 'Sotuv',
  refund: 'Qaytarish',
  withdrawal: 'Yechib olish',
  adjustment: 'Tuzatish',
  escrow_hold: 'Kafolatga olindi',
  escrow_release: 'Kafolatdan berildi',
  escrow_refund: 'Kafolatdan qaytarildi',
};

/**
 * Tranzaksiya balansni oshiradimi.
 *
 * Tur bo'yicha ajratish NOTO'G'RI edi: `adjustment` ikkala tomonga ham
 * ishlaydi va musbat tuzatish qizil minus bo'lib ko'rinardi. Backend
 * summani o'z ishorasi bilan qaytaradi (`"-50000.00"`), shuning uchun
 * yagona ishonchli manba — shu ishora.
 */
export function isCreditTransaction(amount: string): boolean {
  return !amount.trimStart().startsWith('-');
}

/** Ishorasiz summa — belgi alohida chiziladi. */
export function absoluteAmount(amount: string): string {
  return amount.replace('-', '');
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  balance_after: string;
  description: string;
  reference_type: string;
  reference_id: string;
  created_at: string;
}

export const WITHDRAWAL_METHODS = ['card', 'phone'] as const;
export type WithdrawalMethod = (typeof WITHDRAWAL_METHODS)[number];

export const WITHDRAWAL_METHOD_LABELS: Record<WithdrawalMethod, string> = {
  card: 'Bank kartasi',
  phone: 'Telefon raqami',
};

export const WITHDRAWAL_STATUSES = ['pending', 'paid', 'rejected'] as const;
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: 'Kutilmoqda',
  paid: "To'langan",
  rejected: 'Rad etilgan',
};

export interface AdminWithdrawal {
  id: string;
  reference: string;
  amount: string;
  method: WithdrawalMethod;
  destination: string;
  destination_name: string;
  status: WithdrawalStatus;
  admin_note: string;
  processed_at: string | null;
  processed_by: WalletOwner | null;
  user: WalletOwner;
  /** So'rov yuborilgan paytdagi emas, HOZIRGI balans. */
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalStats {
  total: number;
  pending: number;
  paid: number;
  rejected: number;
  pending_amount: string;
  paid_amount: string;
}

export interface WalletsQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  is_frozen?: boolean;
}

export interface WithdrawalsQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  status?: WithdrawalStatus;
  method?: WithdrawalMethod;
}
