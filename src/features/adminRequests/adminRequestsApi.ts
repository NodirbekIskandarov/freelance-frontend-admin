import type { ApiPaginated } from '@/shared/types/api';
import type {
  AdminAssignmentRequest,
  AdminSolutionReport,
  AdminSubjectRequest,
  AssignmentRequestsQuery,
  ReportsQuery,
  SubjectRequestsQuery,
} from '@/shared/types/adminRequests';
import { baseApi } from '@/store/api';

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
    getSubjectRequestsList: build.query<ApiPaginated<AdminSubjectRequest>, SubjectRequestsQuery>({
      query: (params) => ({ url: '/admin/subject-requests/', params }),
      providesTags: [{ type: 'Request', id: 'SUBJECT' }],
    }),

    approveSubjectRequest: build.mutation<AdminSubjectRequest, string>({
      query: (id) => ({ url: `/admin/subject-requests/${id}/approve/`, method: 'POST' }),
      invalidatesTags: [{ type: 'Request', id: 'SUBJECT' }, 'Subject', 'Dashboard'],
    }),

    rejectSubjectRequest: build.mutation<AdminSubjectRequest, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/subject-requests/${id}/reject/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Request', id: 'SUBJECT' }, 'Dashboard'],
    }),

    getAssignmentRequestsList: build.query<
      ApiPaginated<AdminAssignmentRequest>,
      AssignmentRequestsQuery
    >({
      query: (params) => ({ url: '/admin/assignment-requests/', params }),
      providesTags: [{ type: 'Request', id: 'ASSIGNMENT' }],
    }),

    approveAssignmentRequest: build.mutation<AdminAssignmentRequest, string>({
      query: (id) => ({ url: `/admin/assignment-requests/${id}/approve/`, method: 'POST' }),
      invalidatesTags: [{ type: 'Request', id: 'ASSIGNMENT' }, 'Task', 'Variant', 'Dashboard'],
    }),

    rejectAssignmentRequest: build.mutation<AdminAssignmentRequest, { id: string; reason: string }>(
      {
        query: ({ id, ...body }) => ({
          url: `/admin/assignment-requests/${id}/reject/`,
          method: 'POST',
          body,
        }),
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
      invalidatesTags: ['Report', 'Solution', 'Dashboard'],
    }),

    rejectReport: build.mutation<AdminSolutionReport, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/admin/solution-reports/${id}/reject/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Report', 'Dashboard'],
    }),
  }),
});

export const {
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
