import type { DashboardData } from '@/shared/types/dashboard';
import { baseApi } from '@/store/api';

/**
 * Dashboard endpoint'lari. Har domen o'z faylida `injectEndpoints` bilan
 * qo'shiladi — `store/api.ts` bo'sh qoladi va kod bo'linishi saqlanadi.
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<DashboardData, void>({
      query: () => ({ url: '/dashboard' }),
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
