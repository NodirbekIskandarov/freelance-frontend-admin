import type {
  InstituteSubmissionsResponse,
  SubmissionDetailResponse,
  TodaySubmissionsResponse,
} from '@/shared/types/submissions';
import { baseApi } from '@/store/api';

export const submissionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodaySubmissions: build.query<TodaySubmissionsResponse, void>({
      query: () => ({ url: '/admin/submissions/today' }),
    }),

    getInstituteSubmissions: build.query<InstituteSubmissionsResponse, string>({
      query: (instituteId) => ({ url: `/admin/submissions/institutes/${instituteId}` }),
    }),

    getSubmissionDetail: build.query<SubmissionDetailResponse, string>({
      query: (subjectId) => ({ url: `/admin/submissions/subjects/${subjectId}` }),
    }),
  }),
});

export const {
  useGetTodaySubmissionsQuery,
  useGetInstituteSubmissionsQuery,
  useGetSubmissionDetailQuery,
} = submissionsApi;
