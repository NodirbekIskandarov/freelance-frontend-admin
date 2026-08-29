import type { ApiPaginated } from '@/shared/types/api';
import type {
  Dispute,
  DisputeResolveRequest,
  DisputeStats,
  DisputesQuery,
} from '@/shared/types/disputes';
import { baseApi } from '@/store/api';

/**
 * Xarid shikoyatlari — HAQIQIY backend (`/admin/disputes/`).
 *
 * Qaror pul harakati: hamyonlar va pul jurnali ham eskiradi, shuning uchun
 * `resolve` ularning teglarini ham bekor qiladi. Aks holda moderator
 * qaytarilgan pulni «Pul harakati»da ko'rmasdi.
 */
export const disputesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDisputes: build.query<ApiPaginated<Dispute>, DisputesQuery>({
      query: (params) => ({ url: '/admin/disputes/', params }),
      providesTags: (result) => [
        { type: 'Dispute' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'Dispute' as const, id: item.id })),
      ],
    }),

    getDispute: build.query<Dispute, string>({
      query: (id) => ({ url: `/admin/disputes/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Dispute', id }],
    }),

    getDisputeStats: build.query<DisputeStats, void>({
      query: () => ({ url: '/admin/disputes/stats/' }),
      providesTags: [{ type: 'Dispute', id: 'STATS' }],
    }),

    resolveDispute: build.mutation<Dispute, { id: string } & DisputeResolveRequest>({
      query: ({ id, ...body }) => ({
        url: `/admin/disputes/${id}/resolve/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Dispute', id },
        { type: 'Dispute', id: 'LIST' },
        { type: 'Dispute', id: 'STATS' },
        'Wallet',
        { type: 'Wallet', id: 'LEDGER' },
        // Yechim sotuvdan olib qo'yilgan bo'lishi mumkin.
        { type: 'Solution', id: 'SUBMISSIONS' },
      ],
    }),
  }),
});

export const {
  useGetDisputesQuery,
  useGetDisputeQuery,
  useGetDisputeStatsQuery,
  useResolveDisputeMutation,
} = disputesApi;
