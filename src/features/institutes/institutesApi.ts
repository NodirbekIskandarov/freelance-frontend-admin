import type {
  InstituteRequestsListResponse,
  InstitutesListQuery,
  InstitutesListResponse,
} from '@/shared/types/institutes';
import { baseApi } from '@/store/api';

export const institutesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInstitutes: build.query<InstitutesListResponse, InstitutesListQuery>({
      query: (params) => ({ url: '/admin/institutes', params }),
      providesTags: ['Institute'],
    }),

    getInstituteRequests: build.query<InstituteRequestsListResponse, InstitutesListQuery>({
      query: (params) => ({ url: '/admin/institute-requests', params }),
      providesTags: ['Institute'],
    }),
  }),
});

export const { useGetInstitutesQuery, useGetInstituteRequestsQuery } = institutesApi;
