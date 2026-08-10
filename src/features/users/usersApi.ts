import type { UsersListQuery, UsersListResponse } from '@/shared/types/users';
import { baseApi } from '@/store/api';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<UsersListResponse, UsersListQuery>({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery } = usersApi;
