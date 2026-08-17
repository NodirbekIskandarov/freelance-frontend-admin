import type { ApiPaginated } from '@/shared/types/api';
import type {
  AdminDashboard,
  AdminUniversitySummary,
  AdminVariantDemand,
} from '@/shared/types/adminDashboard';
import type {
  AdminFreelancer,
  AdminFreelancerApplication,
  ApplicationStats,
  ApplicationsQuery,
  FreelancerStats,
  FreelancersQuery,
} from '@/shared/types/adminFreelance';
import type { ApiListQuery } from '@/shared/types/api';
import { baseApi } from '@/store/api';

/**
 * Admin dashboard, freelancer arizalari va freelancerlar — HAQIQIY
 * backend. Bu uch bo'lim ilgari mock'da edi.
 */
export const adminFreelanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminDashboard: build.query<AdminDashboard, { days?: number } | void>({
      query: (arg) => ({ url: '/admin/dashboard/', params: arg ?? undefined }),
      providesTags: ['Dashboard'],
    }),

    getUniversitySummary: build.query<
      ApiPaginated<AdminUniversitySummary>,
      ApiListQuery & { is_active?: boolean; city?: string }
    >({
      query: (params) => ({ url: '/admin/universities/summary/', params }),
      providesTags: ['Institute'],
    }),

    getVariantDemand: build.query<
      ApiPaginated<AdminVariantDemand>,
      ApiListQuery & { assignment?: string; is_active?: boolean }
    >({
      query: (params) => ({ url: '/admin/variant-demand/', params }),
      providesTags: ['Variant'],
    }),

    getFreelancerApplications: build.query<
      ApiPaginated<AdminFreelancerApplication>,
      ApplicationsQuery
    >({
      query: (params) => ({ url: '/admin/freelance/applications/', params }),
      providesTags: (result) => [
        { type: 'Application' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'Application' as const, id: item.id })),
      ],
    }),

    getFreelancerApplication: build.query<AdminFreelancerApplication, string>({
      query: (id) => ({ url: `/admin/freelance/applications/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Application', id }],
    }),

    getApplicationStats: build.query<ApplicationStats, void>({
      query: () => ({ url: '/admin/freelance/applications/stats/' }),
      providesTags: ['Application'],
    }),

    approveApplication: build.mutation<AdminFreelancerApplication, string>({
      query: (id) => ({ url: `/admin/freelance/applications/${id}/approve/`, method: 'POST' }),
      /*
       * Freelancerlar ro'yxati ham yangilanadi: ariza tasdiqlangach
       * yangi freelancer paydo bo'ladi. Dashboard'dagi navbat sonlari
       * ham o'zgaradi.
       */
      invalidatesTags: (_result, _error, id) => [
        { type: 'Application', id },
        { type: 'Application', id: 'LIST' },
        'Freelancer',
        'Dashboard',
      ],
    }),

    rejectApplication: build.mutation<
      AdminFreelancerApplication,
      { id: string; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/freelance/applications/${id}/reject/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Application', id },
        { type: 'Application', id: 'LIST' },
        'Dashboard',
      ],
    }),

    getFreelancers: build.query<ApiPaginated<AdminFreelancer>, FreelancersQuery>({
      query: (params) => ({ url: '/admin/freelance/freelancers/', params }),
      providesTags: (result) => [
        { type: 'Freelancer' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'Freelancer' as const, id: item.id })),
      ],
    }),

    getFreelancerStats: build.query<FreelancerStats, void>({
      query: () => ({ url: '/admin/freelance/freelancers/stats/' }),
      providesTags: ['Freelancer'],
    }),

    /** To'xtatish va tiklash — tanasiz `POST`. */
    suspendFreelancer: build.mutation<AdminFreelancer, string>({
      query: (id) => ({ url: `/admin/freelance/freelancers/${id}/suspend/`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Freelancer', id },
        { type: 'Freelancer', id: 'LIST' },
      ],
    }),

    reinstateFreelancer: build.mutation<AdminFreelancer, string>({
      query: (id) => ({ url: `/admin/freelance/freelancers/${id}/reinstate/`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Freelancer', id },
        { type: 'Freelancer', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetUniversitySummaryQuery,
  useGetVariantDemandQuery,
  useGetFreelancerApplicationsQuery,
  useGetFreelancerApplicationQuery,
  useGetApplicationStatsQuery,
  useApproveApplicationMutation,
  useRejectApplicationMutation,
  useGetFreelancersQuery,
  useGetFreelancerStatsQuery,
  useSuspendFreelancerMutation,
  useReinstateFreelancerMutation,
} = adminFreelanceApi;
