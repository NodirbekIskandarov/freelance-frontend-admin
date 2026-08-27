import type { MonitoringSnapshot } from '@/shared/types/monitoring';
import { baseApi } from '@/store/api';

/**
 * Server monitoringi.
 *
 * Kesh SAQLANMAYDI (`keepUnusedDataFor: 0`): eskirgan raqamlar bu yerda
 * eskirgan yangilikdan battar — «hozir nima bo'lyapti» degan savolga
 * bir daqiqa oldingi javob noto'g'ri javobdir.
 */
export const monitoringApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMonitoring: build.query<MonitoringSnapshot, { window: number }>({
      query: (params) => ({ url: '/admin/monitoring/', params }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetMonitoringQuery } = monitoringApi;
