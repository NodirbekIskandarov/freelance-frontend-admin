import type {
  SubjectRequestsListQuery,
  SubjectRequestsListResponse,
} from '@/shared/types/subjects';
import { baseApi } from '@/store/api';

/**
 * Fan qo'shish ARIZALARI — hali mock.
 *
 * Fanlarning o'zi haqiqiy API'ga ko'chdi
 * (`features/catalogue/catalogueApi.ts`), lekin backendda arizalarni
 * ko'rish/tasdiqlash endpoint'i yo'q: sxemada faqat foydalanuvchi
 * yuboradigan `POST /subject-requests/` bor.
 *
 * Diqqat: bu yerdagi endpoint nomi `getSubjectRequests` — `getSubjects`
 * nomi katalog API'sida band. RTK Query bir xil nomdagi ikkinchi
 * endpoint'ni jimgina tashlab ketadi.
 */
export const subjectRequestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSubjectRequests: build.query<SubjectRequestsListResponse, SubjectRequestsListQuery>({
      query: (params) => ({ url: '/admin/subject-requests', params }),
      providesTags: ['Subject'],
    }),
  }),
});

export const { useGetSubjectRequestsQuery } = subjectRequestsApi;
