import type { ApiListQuery, ApiPaginated } from '@/shared/types/api';
import type {
  Solution,
  SolutionPublishRequest,
  SolutionRejectRequest,
} from '@/shared/types/solutions';
import { baseApi } from '@/store/api';

/**
 * Yechim moderatsiyasi — HAQIQIY backend, mock emas.
 *
 * Yo'llar oxirida slash bor: Django `APPEND_SLASH` slashsiz manzilni 301
 * bilan qaytaradi va POST tanasi yo'lda yo'qoladi. Bu MSW handler'laridan
 * ham ajratib turadi — ular slashsiz yo'llarda ro'yxatdan o'tgan.
 */
export const solutionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPendingSolutions: build.query<ApiPaginated<Solution>, ApiListQuery>({
      query: (params) => ({ url: '/admin/solutions/pending/', params }),
      providesTags: (result) => [
        { type: 'Solution' as const, id: 'PENDING' },
        ...(result?.results ?? []).map((item) => ({ type: 'Solution' as const, id: item.id })),
      ],
    }),

    getSolution: build.query<Solution, string>({
      query: (id) => ({ url: `/admin/solutions/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Solution', id }],
    }),

    approveSolution: build.mutation<Solution, string>({
      query: (id) => ({ url: `/admin/solutions/${id}/approve/`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Solution', id },
        { type: 'Solution', id: 'PENDING' },
      ],
    }),

    rejectSolution: build.mutation<Solution, { id: string } & SolutionRejectRequest>({
      query: ({ id, ...body }) => ({
        url: `/admin/solutions/${id}/reject/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Solution', id },
        { type: 'Solution', id: 'PENDING' },
      ],
    }),

    publishSolution: build.mutation<Solution, { id: string } & SolutionPublishRequest>({
      query: ({ id, ...body }) => ({
        url: `/admin/solutions/${id}/publish/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Solution', id },
        { type: 'Solution', id: 'PENDING' },
      ],
    }),

    archiveSolution: build.mutation<Solution, string>({
      query: (id) => ({ url: `/admin/solutions/${id}/archive/`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Solution', id },
        { type: 'Solution', id: 'PENDING' },
      ],
    }),
  }),
});

export const {
  useGetPendingSolutionsQuery,
  useGetSolutionQuery,
  useApproveSolutionMutation,
  useRejectSolutionMutation,
  usePublishSolutionMutation,
  useArchiveSolutionMutation,
} = solutionsApi;
