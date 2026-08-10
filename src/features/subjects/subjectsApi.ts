import type {
  InstitutesPanelResponse,
  SubjectRequestsListQuery,
  SubjectRequestsListResponse,
  SubjectsListResponse,
} from '@/shared/types/subjects';
import { baseApi } from '@/store/api';

interface InstitutePanelQuery {
  page: number;
  limit: number;
  search?: string;
}

interface SubjectsQuery {
  instituteId: string;
  page: number;
  limit: number;
  search?: string;
  course?: string;
}

export const subjectsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInstitutePanel: build.query<InstitutesPanelResponse, InstitutePanelQuery>({
      query: (params) => ({ url: '/admin/institute-summaries', params }),
      providesTags: ['Institute'],
    }),

    getSubjects: build.query<SubjectsListResponse, SubjectsQuery>({
      query: ({ instituteId, ...params }) => ({
        url: `/admin/institutes/${instituteId}/subjects`,
        params,
      }),
      providesTags: ['Subject'],
    }),

    getSubjectRequests: build.query<SubjectRequestsListResponse, SubjectRequestsListQuery>({
      query: (params) => ({ url: '/admin/subject-requests', params }),
      providesTags: ['Subject'],
    }),
  }),
});

export const { useGetInstitutePanelQuery, useGetSubjectsQuery, useGetSubjectRequestsQuery } =
  subjectsApi;
