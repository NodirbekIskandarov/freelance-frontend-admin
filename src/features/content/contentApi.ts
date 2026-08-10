import type { ContentOverview } from '@/shared/types/content';
import { baseApi } from '@/store/api';

export const contentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getContentOverview: build.query<ContentOverview, void>({
      query: () => ({ url: '/admin/content-overview' }),
    }),
  }),
});

export const { useGetContentOverviewQuery } = contentApi;
