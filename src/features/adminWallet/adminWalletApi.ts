import type { ApiPaginated } from '@/shared/types/api';
import type {
  AdminWallet,
  AdminWithdrawal,
  LedgerEntry,
  LedgerQuery,
  LedgerTotals,
  WalletsQuery,
  WalletTransaction,
  WithdrawalsQuery,
  WithdrawalStats,
} from '@/shared/types/adminWallet';
import { baseApi } from '@/store/api';

/**
 * Hamyonlar va pul yechish so'rovlari — HAQIQIY backend
 * (`/admin/wallet/...`).
 *
 * Har bir yozuv amali (`adjust`, `freeze`, `pay`, `reject`) balansga
 * tegadi, shuning uchun ikkala ro'yxat ham birga eskiradi: to'lov
 * tasdiqlansa hamyon balansi ham o'zgaradi.
 */
export const adminWalletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWallets: build.query<ApiPaginated<AdminWallet>, WalletsQuery>({
      query: (params) => ({ url: '/admin/wallet/wallets/', params }),
      providesTags: ['Wallet'],
    }),

    getWallet: build.query<AdminWallet, string>({
      query: (id) => ({ url: `/admin/wallet/wallets/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Wallet', id }],
    }),

    getWalletTransactions: build.query<
      ApiPaginated<WalletTransaction>,
      { id: string; page?: number; page_size?: number; ordering?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/wallet/wallets/${id}/transactions/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Wallet', id: `tx-${id}` }],
    }),

    /**
     * Qo'lda tuzatish. `amount` manfiy ham bo'lishi mumkin — yechib
     * olish uchun. Izoh MAJBURIY: pul harakati sababsiz qolmasin.
     */
    adjustWallet: build.mutation<AdminWallet, { id: string; amount: string; description: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/wallet/wallets/${id}/adjust/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Wallet',
        { type: 'Wallet', id: `tx-${id}` },
        { type: 'Wallet', id: 'LEDGER' },
      ],
    }),

    /**
     * Balansni to'ldirish — tashqarida kelgan pulni yozish (naqd, qo'lda
     * o'tkazma). Tuzatishdan alohida: tuzatish xatoni to'g'rilaydi va
     * ikki tomonga ishlaydi, to'ldirish esa faqat qo'shadi. Izoh
     * MAJBURIY — «bu pul qayerdan keldi» degan savolga javob shu.
     */
    topupWallet: build.mutation<AdminWallet, { id: string; amount: string; description: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/wallet/wallets/${id}/topup/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Wallet',
        { type: 'Wallet', id: `tx-${id}` },
        { type: 'Wallet', id: 'LEDGER' },
      ],
    }),

    /** Butun platforma bo'yicha pul harakati. */
    getLedger: build.query<ApiPaginated<LedgerEntry>, LedgerQuery>({
      query: (params) => ({ url: '/admin/wallet/transactions/', params }),
      providesTags: [{ type: 'Wallet', id: 'LEDGER' }],
    }),

    getLedgerTotals: build.query<LedgerTotals, Omit<LedgerQuery, 'page' | 'page_size'>>({
      query: (params) => ({ url: '/admin/wallet/transactions/totals/', params }),
      providesTags: [{ type: 'Wallet', id: 'LEDGER' }],
    }),

    freezeWallet: build.mutation<AdminWallet, { id: string; frozen: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/admin/wallet/wallets/${id}/freeze/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet'],
    }),

    getWithdrawals: build.query<ApiPaginated<AdminWithdrawal>, WithdrawalsQuery>({
      query: (params) => ({ url: '/admin/wallet/withdrawals/', params }),
      providesTags: ['Withdrawal'],
    }),

    getWithdrawalStats: build.query<WithdrawalStats, void>({
      query: () => ({ url: '/admin/wallet/withdrawals/stats/' }),
      providesTags: [{ type: 'Withdrawal', id: 'STATS' }],
    }),

    getWithdrawal: build.query<AdminWithdrawal, string>({
      query: (id) => ({ url: `/admin/wallet/withdrawals/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Withdrawal', id }],
    }),

    /** Pul o'tkazilgani tasdiqlanadi — izoh ixtiyoriy (chek raqami va h.k.). */
    payWithdrawal: build.mutation<AdminWithdrawal, { id: string; note?: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/wallet/withdrawals/${id}/pay/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Withdrawal', { type: 'Withdrawal', id: 'STATS' }, 'Wallet'],
    }),

    /** Rad etilganda summa hamyonga qaytadi, shuning uchun izoh MAJBURIY. */
    rejectWithdrawal: build.mutation<AdminWithdrawal, { id: string; note: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/wallet/withdrawals/${id}/reject/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Withdrawal', { type: 'Withdrawal', id: 'STATS' }, 'Wallet'],
    }),
  }),
});

export const {
  useGetWalletsQuery,
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useAdjustWalletMutation,
  useTopupWalletMutation,
  useGetLedgerQuery,
  useGetLedgerTotalsQuery,
  useFreezeWalletMutation,
  useGetWithdrawalsQuery,
  useGetWithdrawalStatsQuery,
  useGetWithdrawalQuery,
  usePayWithdrawalMutation,
  useRejectWithdrawalMutation,
} = adminWalletApi;
