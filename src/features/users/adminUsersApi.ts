import type { ApiPaginated } from '@/shared/types/api';
import type {
  AdminUserAccount,
  AdminUsersQuery,
  BlockUserRequest,
} from '@/shared/types/adminUsers';
import { baseApi } from '@/store/api';

/**
 * Admin foydalanuvchilari — HAQIQIY backend, mock emas.
 *
 * Eski `usersApi` (mock `/admin/users`) o'chirildi: bir vaqtning o'zida
 * ikkita "foydalanuvchilar ro'yxati" bo'lishi qaysi biri haqiqat ekanini
 * chalkashtirardi.
 */
export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminUsers: build.query<ApiPaginated<AdminUserAccount>, AdminUsersQuery>({
      query: (params) => ({ url: '/admin/users/', params }),
      providesTags: (result) => [
        { type: 'User' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'User' as const, id: item.id })),
      ],
    }),

    getAdminUser: build.query<AdminUserAccount, string>({
      query: (id) => ({ url: `/admin/users/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    activateUser: build.mutation<AdminUserAccount, string>({
      query: (id) => ({ url: `/admin/users/${id}/activate/`, method: 'PATCH' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    blockUser: build.mutation<AdminUserAccount, { id: string } & BlockUserRequest>({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}/block/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useActivateUserMutation,
  useBlockUserMutation,
} = adminUsersApi;
