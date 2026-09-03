import type { ApiPaginated } from '@/shared/types/api';
import type {
  AdminAssignmentRequest,
  AdminUniversityRequest,
  AdminSolutionReport,
  AdminSubjectRequest,
  AssignmentRequestsQuery,
  ReportsQuery,
  SubjectRequestsQuery,
  UniversityRequestsQuery,
} from '@/shared/types/adminRequests';
import { baseApi } from '@/store/api';

import { optimisticRemove } from './removeRowFromLists';

/**
 * Fan/topshiriq qo'shish arizalari va yechim shikoyatlari — HAQIQIY
 * backend. Uchala bo'lim bir xil oqimga ega, shuning uchun endpoint'lar
 * ham bir xil shaklda.
 *
 * Tasdiqlash katalogni o'zgartiradi (fan yoki topshiriq YARATILADI),
 * shuning uchun tegishli keshlar ham bekor qilinadi.
 */
export const adminRequestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUniversityRequestsList: build.query<
      ApiPaginated<AdminUniversityRequest>,
      UniversityRequestsQuery
    >({
      query: (params) => ({ url: '/admin/university-requests/', params }),
      providesTags: [{ type: 'Request', id: 'UNIVERSITY' }],
    }),

    approveUniversityRequest: build.mutation<AdminUniversityRequest, string>({
      query: (id) => ({ url: `/admin/university-requests/${id}/approve/`, method: 'POST' }),
      onQueryStarted: optimisticRemove('getUniversityRequestsList'),
      // Tasdiqlash UNIVERSITET yaratadi — institutlar ro'yxati ham eskiradi.
      invalidatesTags: [{ type: 'Request', id: 'UNIVERSITY' }, 'Institute', 'Dashboard'],
    }),

    rejectUniversityRequest: build.mutation<AdminUniversityRequest, { id: string; reason: string }>(
      {
        query: ({ id, ...body }) => ({
          url: `/admin/university-requests/${id}/reject/`,
          method: 'POST',
          body,
        }),
        onQueryStarted: optimisticRemove('getUniversityRequestsList'),
        invalidatesTags: [{ type: 'Request', id: 'UNIVERSITY' }, 'Dashboard'],
      },
    ),

    getSubjectRequestsList: build.query<ApiPaginated<AdminSubjectRequest>, SubjectRequestsQuery>({
      query: (params) => ({ url: '/admin/subject-requests/', params }),
      providesTags: [{ type: 'Request', id: 'SUBJECT' }],
    }),

    /**
     * Tasdiqlashda fan nomini ikki tilda berish mumkin.
     *
     * Arizachi bitta tilda yozadi, katalog esa ikkitasini saqlaydi —
     * shuning uchun moderator ko'rib chiqayotgan paytda to'ldiradi.
     * Ikkalasi ham ixtiyoriy: berilmasa ariza qanday bo'lsa shunday
     * tasdiqlanadi.
     */
    approveSubjectRequest: build.mutation<
      AdminSubjectRequest,
      { id: string; name?: string; name_ru?: string; category?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/subject-requests/${id}/approve/`,
        method: 'POST',
        body,
      }),
      onQueryStarted: optimisticRemove('getSubjectRequestsList'),
      // Toifa ham berilishi mumkin — toifalar ro'yxatidagi `subject_count`
      // eskiradi.
      invalidatesTags: [
        { type: 'Request', id: 'SUBJECT' },
        'Subject',
        'SubjectCategory',
        'Dashboard',
      ],
    }),

    rejectSubjectRequest: build.mutation<AdminSubjectRequest, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/subject-requests/${id}/reject/`,
        method: 'POST',
        body,
      }),
      onQueryStarted: optimisticRemove('getSubjectRequestsList'),
      invalidatesTags: [{ type: 'Request', id: 'SUBJECT' }, 'Dashboard'],
    }),

    getAssignmentRequestsList: build.query<
      ApiPaginated<AdminAssignmentRequest>,
      AssignmentRequestsQuery
    >({
      query: (params) => ({ url: '/admin/assignment-requests/', params }),
      providesTags: [{ type: 'Request', id: 'ASSIGNMENT' }],
    }),

    /** Tasdiqlashda nomni ikki tilda berish mumkin — fan arizasidagi kabi. */
    approveAssignmentRequest: build.mutation<
      AdminAssignmentRequest,
      { id: string; title?: string; title_ru?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/assignment-requests/${id}/approve/`,
        method: 'POST',
        body,
      }),
      onQueryStarted: optimisticRemove('getAssignmentRequestsList'),
      invalidatesTags: [{ type: 'Request', id: 'ASSIGNMENT' }, 'Task', 'Variant', 'Dashboard'],
    }),

    rejectAssignmentRequest: build.mutation<AdminAssignmentRequest, { id: string; reason: string }>(
      {
        query: ({ id, ...body }) => ({
          url: `/admin/assignment-requests/${id}/reject/`,
          method: 'POST',
          body,
        }),
        onQueryStarted: optimisticRemove('getAssignmentRequestsList'),
        invalidatesTags: [{ type: 'Request', id: 'ASSIGNMENT' }, 'Dashboard'],
      },
    ),

    getSolutionReports: build.query<ApiPaginated<AdminSolutionReport>, ReportsQuery>({
      query: (params) => ({ url: '/admin/solution-reports/', params }),
      providesTags: ['Report'],
    }),

    /** Shikoyat asosli — yechim moderatsiya holati o'zgarishi mumkin. */
    approveReport: build.mutation<AdminSolutionReport, string>({
      query: (id) => ({ url: `/admin/solution-reports/${id}/approve/`, method: 'POST' }),
      onQueryStarted: optimisticRemove('getSolutionReports'),
      invalidatesTags: ['Report', 'Solution', 'Dashboard'],
    }),

    rejectReport: build.mutation<AdminSolutionReport, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/solution-reports/${id}/reject/`,
        method: 'POST',
        body,
      }),
      onQueryStarted: optimisticRemove('getSolutionReports'),
      invalidatesTags: ['Report', 'Dashboard'],
    }),
  }),
});

export const {
  useGetUniversityRequestsListQuery,
  useApproveUniversityRequestMutation,
  useRejectUniversityRequestMutation,
  useGetSubjectRequestsListQuery,
  useApproveSubjectRequestMutation,
  useRejectSubjectRequestMutation,
  useGetAssignmentRequestsListQuery,
  useApproveAssignmentRequestMutation,
  useRejectAssignmentRequestMutation,
  useGetSolutionReportsQuery,
  useApproveReportMutation,
  useRejectReportMutation,
} = adminRequestsApi;
