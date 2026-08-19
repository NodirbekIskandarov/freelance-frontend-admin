import type { ApiPaginated } from '@/shared/types/api';
import type { AuditLog, AuditQuery } from '@/shared/types/adminAudit';
import { baseApi } from '@/store/api';

/**
 * Audit jurnali — faqat o'qish. Yozuvlar backendda amal bajarilganda
 * hosil bo'ladi, shuning uchun bu yerda mutatsiya yo'q va `invalidatesTags`
 * ham kerak emas.
 */
export const adminAuditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAuditLogs: build.query<ApiPaginated<AuditLog>, AuditQuery>({
      query: (params) => ({ url: '/admin/audit/', params }),
      providesTags: ['Audit'],
    }),

    getAuditLog: build.query<AuditLog, string>({
      query: (id) => ({ url: `/admin/audit/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Audit', id }],
    }),
  }),
});

export const { useGetAuditLogsQuery, useGetAuditLogQuery } = adminAuditApi;
