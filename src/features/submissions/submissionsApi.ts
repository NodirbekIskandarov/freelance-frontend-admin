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
 *
 * Har bir so'rov o'zining aniq tegidan tashqari umumiy `SUBMISSIONS`
 * tegini ham beradi. Sabab: moderatsiya (`/admin/solutions/…/publish/`)
 * va variantni tahrirlash boshqa modulda va ular qaysi fan/topshiriq
 * ro'yxati eskirganini bilmaydi — bitta umumiy teg bilan hammasi bir
 * yo'la yangilanadi. Bo'lim kichik, ortiqcha so'rov sezilmaydi.
 */
const SUBMISSIONS = { type: 'Solution' as const, id: 'SUBMISSIONS' };
export const submissionsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSubmissionUniversities: build.query<SubmissionUniversity[], { today?: boolean } | void>({
      query: (args) => ({ url: '/admin/submissions/universities/', params: args ?? undefined }),
      providesTags: [{ type: 'Solution', id: 'SUBMISSION-UNIS' }, SUBMISSIONS],
    }),

    getTodaySubmissions: build.query<ApiPaginated<Submission>, TodaySubmissionsQuery>({
      query: (params) => ({ url: '/admin/submissions/today/', params }),
      providesTags: [{ type: 'Solution', id: 'SUBMISSION-TODAY' }, SUBMISSIONS],
    }),

    getSubmissionSubjects: build.query<ApiPaginated<SubmissionSubject>, SubmissionSubjectsQuery>({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/universities/${id}/subjects/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [
        { type: 'Solution', id: `sub-uni-${id}` },
        SUBMISSIONS,
      ],
    }),

    getSubmissionAssignments: build.query<
      ApiPaginated<SubmissionAssignment>,
      SubmissionAssignmentsQuery
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/subjects/${id}/assignments/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [
        { type: 'Solution', id: `sub-subj-${id}` },
        SUBMISSIONS,
      ],
    }),

    getSubmissionVariants: build.query<
      SubmissionVariant[],
      { id: string; ordering?: string; search?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/assignments/${id}/variants/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [
        { type: 'Solution', id: `sub-asg-${id}` },
        SUBMISSIONS,
      ],
    }),

    getSubmissionAnswers: build.query<ApiPaginated<Submission>, SubmissionAnswersQuery>({
      query: ({ id, ...params }) => ({
        url: `/admin/submissions/variants/${id}/answers/`,
        params,
      }),
      providesTags: (_result, _error, { id }) => [
        { type: 'Solution', id: `sub-var-${id}` },
        SUBMISSIONS,
      ],
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
