import type { AdminAppeal, AppealsQuery, AppealStats } from '@/shared/types/adminAppeals';
import type { ApiPaginated } from '@/shared/types/api';
import { baseApi } from '@/store/api';

/**
 * Murojaatlar — HAQIQIY backend (`/admin/appeals/`).
 *
 * `take/` va `reply/` bir xil obyektni qaytaradi, shuning uchun ikkalasi
 * ham ro'yxat bilan birga statistikani ham eskirtiradi: holat o'zgarishi
 * yuqoridagi sanoqlarni siljitadi.
 */
export const adminAppealsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAppeals: build.query<ApiPaginated<AdminAppeal>, AppealsQuery>({
      query: (params) => ({ url: '/admin/appeals/', params }),
      providesTags: ['Appeal'],
    }),

    getAppealStats: build.query<AppealStats, void>({
      query: () => ({ url: '/admin/appeals/stats/' }),
      providesTags: [{ type: 'Appeal', id: 'STATS' }],
    }),

    getAppeal: build.query<AdminAppeal, string>({
      query: (id) => ({ url: `/admin/appeals/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Appeal', id }],
    }),

    /** Murojaatni o'z zimmasiga olish — tanasiz POST. */
    takeAppeal: build.mutation<AdminAppeal, string>({
      query: (id) => ({ url: `/admin/appeals/${id}/take/`, method: 'POST' }),
      invalidatesTags: ['Appeal', { type: 'Appeal', id: 'STATS' }],
    }),

    replyToAppeal: build.mutation<AdminAppeal, { id: string; reply: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/appeals/${id}/reply/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Appeal', { type: 'Appeal', id: 'STATS' }],
    }),
  }),
});

export const {
  useGetAppealsQuery,
  useGetAppealStatsQuery,
  useGetAppealQuery,
  useTakeAppealMutation,
  useReplyToAppealMutation,
} = adminAppealsApi;
