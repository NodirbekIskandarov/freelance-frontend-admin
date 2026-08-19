import type { ContentOverview } from '@/shared/types/content';
import { baseApi } from '@/store/api';

export const contentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * `days` grafik oralig'ini va `revenue_window` hisobini boshqaradi —
     * backend o'sha oraliqni oldingi teng oraliq bilan solishtirib
     * `change_percent` qaytaradi.
     */
    getContentOverview: build.query<ContentOverview, { days?: number } | void>({
      query: (args) => ({ url: '/admin/content-overview/', params: args ?? undefined }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetContentOverviewQuery } = contentApi;
