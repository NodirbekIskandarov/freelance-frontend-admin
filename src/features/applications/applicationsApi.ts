import type { ApplicationsListQuery, ApplicationsListResponse } from '@/shared/types/applications';
import { baseApi } from '@/store/api';

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFreelancerApplications: build.query<ApplicationsListResponse, ApplicationsListQuery>({
      query: (params) => ({ url: '/admin/freelancer-applications', params }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetFreelancerApplicationsQuery } = applicationsApi;
