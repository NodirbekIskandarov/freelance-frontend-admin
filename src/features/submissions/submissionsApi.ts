import type { ApiPaginated } from '@/shared/types/api';
import type {
  Submission,
  SubmissionAnswersQuery,
  SubmissionAssignment,
  SubmissionAssignmentsQuery,
  SubmissionSubject,
  SubmissionSubjectsQuery,
  SubmissionUniversity,
  SubmissionVariant,
  TodaySubmissionsQuery,
} from '@/shared/types/submissions';
import { baseApi } from '@/store/api';

/**
 * Yuborilgan javoblar — HAQIQIY backend.
 *
 * Institutlar va variantlar ro'yxati SAHIFALANMAGAN massiv qaytaradi
 * (ular chap panelda to'liq ko'rsatiladi), qolgan uchtasi sahifalangan.
 */
export const submissionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSubmissionUniversities: build.query<SubmissionUniversity[], { today?: boolean } | void>({
      query: (args) => ({ url: '/admin/submissions/universities/', params: args ?? undefined }),
      providesTags: [{ type: 'Solution', id: 'SUBMISSION-UNIS' }],
    }),

    getTodaySubmissions: build.query<ApiPaginated<Submission>, TodaySubmissionsQuery>({
      query: (params) => ({ url: '/admin/submissions/today/', params }),
      providesTags: [{ type: 'Solution', id: 'SUBMISSION-TODAY' }],
    }),

    getSubmissionSubjects: build.query<ApiPaginated<SubmissionSubject>, SubmissionSubjectsQuery>({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/universities/${id}/subjects/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Solution', id: `sub-uni-${id}` }],
    }),

    getSubmissionAssignments: build.query<
      ApiPaginated<SubmissionAssignment>,
      SubmissionAssignmentsQuery
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/subjects/${id}/assignments/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Solution', id: `sub-subj-${id}` }],
    }),

    getSubmissionVariants: build.query<
      SubmissionVariant[],
      { id: string; ordering?: string; search?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/assignments/${id}/variants/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Solution', id: `sub-asg-${id}` }],
    }),

    getSubmissionAnswers: build.query<ApiPaginated<Submission>, SubmissionAnswersQuery>({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/variants/${id}/answers/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'Solution', id: `sub-var-${id}` }],
    }),
  }),
});

export const {
  useGetSubmissionUniversitiesQuery,
  useGetTodaySubmissionsQuery,
  useGetSubmissionSubjectsQuery,
  useGetSubmissionAssignmentsQuery,
  useGetSubmissionVariantsQuery,
  useGetSubmissionAnswersQuery,
} = submissionsApi;
