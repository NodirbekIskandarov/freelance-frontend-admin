import type { ApiListQuery, ApiPaginated } from '@/shared/types/api';
import type {
  Assignment,
  AssignmentsQuery,
  AssignmentWriteRequest,
  Subject,
  Variant,
  VariantsQuery,
  VariantWriteRequest,
} from '@/shared/types/assignments';
import { baseApi } from '@/store/api';

/**
 * Topshiriqlar CRUD — HAQIQIY backend.
 *
 * `PATCH` ishlatiladi, `PUT` emas: qisman yangilashda o'zgarmagan
 * maydonlarni qayta yuborish shart emas va boshqa moderator bir vaqtda
 * kiritgan o'zgarishni tasodifan bosib ketmaymiz.
 */
export const assignmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAssignments: build.query<ApiPaginated<Assignment>, AssignmentsQuery>({
      query: (params) => ({ url: '/assignments/', params }),
      providesTags: (result) => [
        { type: 'Task' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'Task' as const, id: item.id })),
      ],
    }),

    getAssignment: build.query<Assignment, string>({
      query: (id) => ({ url: `/assignments/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),

    createAssignment: build.mutation<Assignment, AssignmentWriteRequest>({
      query: (body) => ({ url: '/assignments/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    updateAssignment: build.mutation<
      Assignment,
      { id: string } & Partial<AssignmentWriteRequest>
    >({
      query: ({ id, ...body }) => ({ url: `/assignments/${id}/`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),

    /** Soft-delete: katalogdan yashiriladi, tarix uchun saqlanadi. */
    deleteAssignment: build.mutation<void, string>({
      query: (id) => ({ url: `/assignments/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    getAssignmentVariants: build.query<ApiPaginated<Variant>, string>({
      query: (id) => ({ url: `/assignments/${id}/variants/` }),
      providesTags: (_result, _error, id) => [{ type: 'Task', id: `variants-${id}` }],
    }),

    /** Topshiriq yaratishda fan tanlash uchun. */
    getSubjects: build.query<ApiPaginated<Subject>, ApiListQuery>({
      query: (params) => ({ url: '/subjects/', params }),
      providesTags: ['Subject'],
    }),

    getVariants: build.query<ApiPaginated<Variant>, VariantsQuery>({
      query: (params) => ({ url: '/variants/', params }),
      providesTags: (result) => [
        { type: 'Variant' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'Variant' as const, id: item.id })),
      ],
    }),

    createVariant: build.mutation<Variant, VariantWriteRequest>({
      query: (body) => ({ url: '/variants/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Variant', id: 'LIST' }],
    }),

    updateVariant: build.mutation<Variant, { id: string } & Partial<VariantWriteRequest>>({
      query: ({ id, ...body }) => ({ url: `/variants/${id}/`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Variant', id },
        { type: 'Variant', id: 'LIST' },
      ],
    }),

    deleteVariant: build.mutation<void, string>({
      query: (id) => ({ url: `/variants/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Variant', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useGetAssignmentQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentVariantsQuery,
  useGetSubjectsQuery,
  useGetVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} = assignmentsApi;
