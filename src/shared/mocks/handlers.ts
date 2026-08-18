import { delay, http, HttpResponse } from 'msw';

import type { ContentOverview } from '../types/content';
import type { InstituteRequest, InstituteRequestsListResponse } from '../types/institutes';
import { mockInstituteRequests, regions } from './institutes';
import type {
  InstituteSubmissionsResponse,
  SubmissionDetailResponse,
  TodaySubmissionsResponse,
} from '../types/submissions';
import {
  mockInstituteSubmissions,
  mockSubmissionDetail,
  mockTodaySubmissions,
} from './submissions';
import { submissionInstitutes } from './submissions';
import { mockContentOverview } from './content';

/** Tarmoq kechikishini taqlid qiladi — loading holatlari real ko'rinsin. */
const LATENCY_MS = 300;

// Handler'lar API manziliga bog'lab yaratiladi.
//
// Ilgari yo'llar wildcard bilan yozilgan edi va bu jiddiy xatoga olib keldi:
// wildcard + "users/:id" naqshi Vite'ning dev modul so'rovini ham ushlab qolardi
// (/src/features/users/UsersPage.tsx da :id = "UsersPage.tsx"), natijada sahifa
// "Failed to fetch dynamically imported module" bilan yiqilardi.
//
// To'liq manzilga bog'langanda handler faqat haqiqiy API so'rovlarini ushlaydi.
export function createHandlers(baseUrl: string) {
  const path = (suffix: string) => `${baseUrl.replace(/\/$/, '')}/${suffix}`;

  return [
    http.get(path(`admin/submissions/today`), async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json<TodaySubmissionsResponse>(mockTodaySubmissions);
    }),

    http.get(path(`admin/submissions/institutes/:instituteId`), async ({ params }) => {
      await delay(LATENCY_MS);

      const found = submissionInstitutes.find((item) => item.id === params.instituteId);

      return HttpResponse.json<InstituteSubmissionsResponse>({
        ...mockInstituteSubmissions,
        instituteShort: found?.short ?? mockInstituteSubmissions.instituteShort,
      });
    }),

    http.get(path(`admin/submissions/subjects/:subjectId`), async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json<SubmissionDetailResponse>(mockSubmissionDetail);
    }),

    http.get(path(`admin/institute-requests`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
      const region = url.searchParams.get('region') ?? 'all';
      const status = url.searchParams.get('status') ?? 'all';

      let filtered: InstituteRequest[] = mockInstituteRequests;

      if (region !== 'all') filtered = filtered.filter((item) => item.region === region);
      if (status !== 'all') filtered = filtered.filter((item) => item.status === status);
      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.requester.name.toLowerCase().includes(search),
        );
      }

      const start = (page - 1) * limit;

      return HttpResponse.json<InstituteRequestsListResponse>({
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
        regions,
      });
    }),

    http.get(path(`admin/content-overview`), async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json<ContentOverview>(mockContentOverview);
    }),

    // Aniq yo'l umumiy ro'yxatdan OLDIN turishi kerak: MSW birinchi mos
    // kelgan handler'ni ishlatadi, aks holda ":id" ni ro'yxat ushlab qoladi.
  ];
}
