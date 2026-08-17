import type { InstituteRequestsListResponse, InstitutesListQuery } from '@/shared/types/institutes';
import { baseApi } from '@/store/api';

/**
 * Institut qo'shish ARIZALARI — hali mock.
 *
 * Institutlarning o'zi haqiqiy API'ga ko'chdi
 * (`features/catalogue/catalogueApi.ts`), lekin backendda arizalarni
 * ko'rish/tasdiqlash endpoint'i yo'q: sxemada faqat foydalanuvchi
 * yuboradigan `POST` bor. Shu bo'lim paydo bo'lgach bu fayl o'chadi.
 */
export const instituteRequestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInstituteRequests: build.query<InstituteRequestsListResponse, InstitutesListQuery>({
      query: (params) => ({ url: '/admin/institute-requests', params }),
      providesTags: ['Institute'],
    }),
  }),
});

export const { useGetInstituteRequestsQuery } = instituteRequestsApi;
