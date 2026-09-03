import type { AdminOverview, OverviewPeriod } from '@/shared/types/adminOverview';
import { baseApi } from '@/store/api';

/**
 * Dashboard — bitta so'rov, bitta davr.
 *
 * Kesh kaliti davr bo'yicha: tanlagich bosilganda avval ko'rilgan davr
 * darhol qaytadi va ekran qayta yuklanmaydi.
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminOverview: build.query<AdminOverview, OverviewPeriod>({
      query: (period) => ({ url: '/admin/dashboard/overview/', params: { period } }),
      providesTags: (_result, _error, period) => [{ type: 'Dashboard', id: period }],
    }),
  }),
});

export const { useGetAdminOverviewQuery } = dashboardApi;
