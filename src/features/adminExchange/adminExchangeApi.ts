import type {
  AdminOffer,
  AdminTask,
  AdminTasksQuery,
  TaskStats,
} from '@/shared/types/adminExchange';
import type { ApiPaginated } from '@/shared/types/api';
import { baseApi } from '@/store/api';

/**
 * Birja nazorati — HAQIQIY backend (`/admin/freelance/tasks/`).
 *
 * `refund/` kafolatdagi pulni mijozga qaytaradi, shuning uchun u
 * hamyonlar ro'yxatini ham eskirtiradi.
 */
export const adminExchangeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminTasks: build.query<ApiPaginated<AdminTask>, AdminTasksQuery>({
      query: (params) => ({ url: '/admin/freelance/tasks/', params }),
      providesTags: ['ExchangeTask'],
    }),

    getAdminTaskStats: build.query<TaskStats, void>({
      query: () => ({ url: '/admin/freelance/tasks/stats/' }),
      providesTags: [{ type: 'ExchangeTask', id: 'STATS' }],
    }),

    getAdminTask: build.query<AdminTask, string>({
      query: (id) => ({ url: `/admin/freelance/tasks/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'ExchangeTask', id }],
    }),

    getAdminTaskOffers: build.query<ApiPaginated<AdminOffer>, string>({
      query: (id) => ({ url: `/admin/freelance/tasks/${id}/offers/` }),
      providesTags: (_result, _error, id) => [{ type: 'ExchangeTask', id: `offers-${id}` }],
    }),

    /** Aralashuv sababi MAJBURIY — pul harakatlanmoqda. */
    refundTask: build.mutation<AdminTask, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/freelance/tasks/${id}/refund/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExchangeTask', { type: 'ExchangeTask', id: 'STATS' }, 'Wallet'],
    }),
  }),
});

export const {
  useGetAdminTasksQuery,
  useGetAdminTaskStatsQuery,
  useGetAdminTaskQuery,
  useGetAdminTaskOffersQuery,
  useRefundTaskMutation,
} = adminExchangeApi;
