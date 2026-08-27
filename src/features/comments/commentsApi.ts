import type { ApiPaginated } from '@/shared/types/api';
import type { AdminComment, CommentsQuery } from '@/shared/types/comments';
import { baseApi } from '@/store/api';

/**
 * Izohlar moderatsiyasi.
 *
 * O'chirish `/comments/{id}/` ga boradi — bu ochiq yo'l, lekin xodim
 * istalgan izohni olib tashlay oladi, muallif esa faqat o'zinikini.
 * Tekshiruv serverda.
 */
export const commentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getComments: build.query<ApiPaginated<AdminComment>, CommentsQuery>({
      query: (params) => ({ url: '/admin/assignment-comments/', params }),
      providesTags: [{ type: 'Comment', id: 'LIST' }],
    }),

    deleteComment: build.mutation<void, string>({
      query: (id) => ({ url: `/comments/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Comment', id: 'LIST' }],
    }),
  }),
});

export const { useGetCommentsQuery, useDeleteCommentMutation } = commentsApi;
