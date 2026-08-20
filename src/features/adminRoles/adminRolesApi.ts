import type { ApiPaginated } from '@/shared/types/api';
import type {
  MyPermissions,
  PermissionCatalogue,
  Role,
  RolesQuery,
  RoleWriteRequest,
} from '@/shared/types/adminRoles';
import { baseApi } from '@/store/api';

/**
 * Rollar va ruxsatlar — HAQIQIY backend.
 *
 * Rol o'zgarsa `Permission` keshi ham eskiradi: joriy foydalanuvchining
 * o'zi o'sha rolda bo'lishi mumkin va menyu darhol qayta hisoblanishi
 * kerak.
 */
export const adminRolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<ApiPaginated<Role>, RolesQuery>({
      query: (params) => ({ url: '/admin/roles/', params }),
      providesTags: ['Role'],
    }),

    getRole: build.query<Role, string>({
      query: (id) => ({ url: `/admin/roles/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),

    /**
     * Ruxsatlar katalogi — muharrir aynan shuni chizadi, qo'lda yozilgan
     * ro'yxatni emas.
     *
     * Diqqat: Swagger buni `PaginatedPermissionCatalogueList` deb
     * ko'rsatadi, server esa YALANG'OCH MASSIV qaytaradi (brauzerdan
     * tekshirilgan). Sahifalash parametrlari ham e'tiborga olinmaydi.
     */
    getPermissionCatalogue: build.query<PermissionCatalogue[], void>({
      query: () => ({ url: '/admin/roles/permissions/' }),
      providesTags: [{ type: 'Role', id: 'PERMISSIONS' }],
    }),

    createRole: build.mutation<Role, RoleWriteRequest>({
      query: (body) => ({ url: '/admin/roles/', method: 'POST', body }),
      invalidatesTags: ['Role'],
    }),

    /** Tizim rolini tahrirlab bo'lmaydi — backend 403 qaytaradi. */
    updateRole: build.mutation<Role, { id: string } & Partial<RoleWriteRequest>>({
      query: ({ id, ...body }) => ({ url: `/admin/roles/${id}/`, method: 'PATCH', body }),
      invalidatesTags: ['Role', 'Permission'],
    }),

    deleteRole: build.mutation<void, string>({
      query: (id) => ({ url: `/admin/roles/${id}/`, method: 'DELETE' }),
      invalidatesTags: ['Role', 'Permission'],
    }),

    /**
     * BUTUNLAY almashtiradi, qo'shmaydi. Backend izohi: muharrir
     * katakchalarning to'liq to'plamini ko'rsatadi va ko'rsatganini
     * saqlaydi — qisman yangilash foydalanuvchi ko'rgan holat bilan
     * jimgina ziddiyatga tushardi.
     */
    setStaffRoles: build.mutation<MyPermissions, { id: string; role_ids: string[] }>({
      query: ({ id, ...body }) => ({
        url: `/admin/staff/${id}/roles/`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Role', 'User', 'Permission'],
    }),

    getMyPermissions: build.query<MyPermissions, void>({
      query: () => ({ url: '/me/permissions/' }),
      providesTags: ['Permission'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useGetPermissionCatalogueQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useSetStaffRolesMutation,
  useGetMyPermissionsQuery,
} = adminRolesApi;
