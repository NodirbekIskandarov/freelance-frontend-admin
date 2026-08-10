import type { FreelancersListQuery, FreelancersListResponse } from '@/shared/types/freelancers';
import { baseApi } from '@/store/api';

export const freelancersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFreelancers: build.query<FreelancersListResponse, FreelancersListQuery>({
      query: (params) => ({ url: '/admin/freelancers', params }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetFreelancersQuery } = freelancersApi;
