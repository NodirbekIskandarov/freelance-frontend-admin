import type { ApiListQuery, ApiPaginated } from '@/shared/types/api';
import type {
  Direction,
  Faculty,
  Subject,
  SubjectsQuery,
  SubjectWriteRequest,
  UniversitiesQuery,
  University,
  UniversityWriteRequest,
} from '@/shared/types/catalogue';
import { baseApi } from '@/store/api';

/**
 * Fayl biriktirilgan bo'lsa `FormData`, aks holda oddiy JSON.
 *
 * Har doim `FormData` yuborib bo'lmaydi: undagi hamma narsa matnga
 * aylanadi va `is_active: false` "false" satriga, `undefined` esa
 * "undefined" ga aylanib ketardi. `fetchBaseQuery` `FormData` ni ko'rsa
 * `Content-Type` ni o'zi qo'ymaydi — chegarani brauzer qo'shadi.
 */
function toBody<T extends object>(input: T): T | FormData {
  const values = input as Record<string, unknown>;
  if (!(values.logo instanceof File)) return input;

  const form = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    form.append(key, value instanceof File ? value : String(value));
  }
  return form;
}

/**
 * Katalog CRUD — HAQIQIY backend.
 *
 * Yangilash uchun `PATCH` (`PUT` emas): o'zgarmagan maydonlarni qayta
 * yubormaymiz va boshqa moderator bir vaqtda kiritgan o'zgarishni
 * tasodifan bosib ketmaymiz.
 */
export const catalogueApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUniversities: build.query<ApiPaginated<University>, UniversitiesQuery>({
      query: (params) => ({ url: '/universities/', params }),
      providesTags: (result) => [
        { type: 'Institute' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'Institute' as const, id: item.id })),
      ],
    }),

    /**
     * Bitta institut — manzildagi `?university=` bo'yicha tiklash uchun.
     *
     * Ro'yxat so'rovi ID bo'yicha filtrlay olmaydi, sahifa esa panelga
     * to'liq obyektni berishi kerak (nom, logotip, sanoqlar).
     */
    getUniversity: build.query<University, string>({
      query: (id) => ({ url: `/universities/${id}/` }),
      providesTags: (_result, _error, id) => [{ type: 'Institute', id }],
    }),

    createUniversity: build.mutation<University, UniversityWriteRequest>({
      query: (body) => ({ url: '/universities/', method: 'POST', body: toBody(body) }),
      invalidatesTags: [{ type: 'Institute', id: 'LIST' }],
    }),

    updateUniversity: build.mutation<University, { id: string } & Partial<UniversityWriteRequest>>({
      query: ({ id, ...body }) => ({
        url: `/universities/${id}/`,
        method: 'PATCH',
        body: toBody(body),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Institute', id },
        { type: 'Institute', id: 'LIST' },
      ],
    }),

    /** Soft-delete: katalogdan yashiriladi, tarix uchun saqlanadi. */
    deleteUniversity: build.mutation<void, string>({
      query: (id) => ({ url: `/universities/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Institute', id: 'LIST' }],
    }),

    getSubjects: build.query<ApiPaginated<Subject>, SubjectsQuery>({
      query: (params) => ({ url: '/subjects/', params }),
      providesTags: (result) => [
        { type: 'Subject' as const, id: 'LIST' },
        ...(result?.results ?? []).map((item) => ({ type: 'Subject' as const, id: item.id })),
      ],
    }),

    createSubject: build.mutation<Subject, SubjectWriteRequest>({
      query: (body) => ({ url: '/subjects/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Subject', id: 'LIST' }],
    }),

    updateSubject: build.mutation<Subject, { id: string } & Partial<SubjectWriteRequest>>({
      query: ({ id, ...body }) => ({ url: `/subjects/${id}/`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Subject', id },
        { type: 'Subject', id: 'LIST' },
      ],
    }),

    deleteSubject: build.mutation<void, string>({
      query: (id) => ({ url: `/subjects/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Subject', id: 'LIST' }],
    }),

    /*
     * Fakultet va yo'nalish — faqat o'qish. Backend ularni yozishga
     * ochmagan, shuning uchun admin panelda ular tanlov ro'yxati
     * sifatida ishlatiladi, tahrirlanmaydi.
     */
    getFaculties: build.query<ApiPaginated<Faculty>, ApiListQuery & { university?: string }>({
      query: (params) => ({ url: '/faculties/', params }),
    }),

    /**
     * `university` — fakultetlar ustidagi daraja.
     *
     * Usiz filtr ekranlari barcha institutlarning yo'nalishlarini
     * olardi va bir xil nom («Dasturiy injiniring») ro'yxatda necha
     * institut bo'lsa shuncha marta chiqardi.
     */
    getDirections: build.query<
      ApiPaginated<Direction>,
      ApiListQuery & { faculty?: string; university?: string }
    >({
      query: (params) => ({ url: '/directions/', params }),
    }),
  }),
});

export const {
  useGetUniversitiesQuery,
  useGetUniversityQuery,
  useCreateUniversityMutation,
  useUpdateUniversityMutation,
  useDeleteUniversityMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetFacultiesQuery,
  useGetDirectionsQuery,
} = catalogueApi;
