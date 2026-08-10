import type { InstituteSubjectsResponse, SubjectDetail } from '@/shared/types/tasks';
import { baseApi } from '@/store/api';

interface InstituteSubjectsQuery {
  instituteId: string;
  page: number;
  limit: number;
  search?: string;
  course?: string;
  semester?: string;
  status?: string;
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInstituteSubjects: build.query<InstituteSubjectsResponse, InstituteSubjectsQuery>({
      query: ({ instituteId, ...params }) => ({
        url: `/admin/institutes/${instituteId}/subject-rows`,
        params,
      }),
      providesTags: ['Subject'],
    }),

    getSubjectDetail: build.query<SubjectDetail, string>({
      query: (subjectId) => ({ url: `/admin/subjects/${subjectId}` }),
      providesTags: ['Task'],
    }),
  }),
});

export const { useGetInstituteSubjectsQuery, useGetSubjectDetailQuery } = tasksApi;
