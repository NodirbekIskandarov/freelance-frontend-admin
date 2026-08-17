import { delay, http, HttpResponse } from 'msw';

import type { Paginated, User } from '../types/api';
import type {
  ApplicationsListResponse,
  ApplicationStatus,
  FreelancerApplication,
} from '../types/applications';
import type { DashboardData } from '../types/dashboard';
import type { Freelancer, FreelancersListResponse, FreelancerStatus } from '../types/freelancers';
import type { ApplicationDetail } from '../types/applicationDetail';
import type { ContentOverview } from '../types/content';
import type {
  Institute,
  InstituteRequest,
  InstituteRequestsListResponse,
  InstitutesListResponse,
} from '../types/institutes';
import type {
  InstitutesPanelResponse,
  Subject,
  SubjectRequest,
  SubjectRequestsListResponse,
  SubjectsListResponse,
} from '../types/subjects';
import { mockInstituteRequests, mockInstitutes, regions } from './institutes';
import { instituteSummaries, mockSubjectRequests, mockSubjects } from './subjects';
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
import { mockApplicationDetail } from './applicationDetail';
import { mockContentOverview } from './content';
import { mockApplications, universities } from './applications';
import { mockDashboard } from './dashboard';
import { mockUsers } from './data';
import { institutes, mockFreelancers, specialities } from './freelancers';

/** Tarmoq kechikishini taqlid qiladi — loading holatlari real ko'rinsin. */
const LATENCY_MS = 300;

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

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

    http.get(path(`admin/institute-summaries`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '8');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';

      const filtered = search
        ? instituteSummaries.filter(
            (item) =>
              item.short.toLowerCase().includes(search) || item.name.toLowerCase().includes(search),
          )
        : instituteSummaries;

      const start = (page - 1) * limit;

      return HttpResponse.json<InstitutesPanelResponse>({
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
      });
    }),

    http.get(path(`admin/institutes/:instituteId/subjects`), async ({ request, params }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
      const course = url.searchParams.get('course') ?? 'all';

      const institute =
        instituteSummaries.find((item) => item.id === params.instituteId) ?? instituteSummaries[0]!;

      let filtered: Subject[] = mockSubjects;
      if (course !== 'all') filtered = filtered.filter((item) => item.course === course);
      if (search) filtered = filtered.filter((item) => item.name.toLowerCase().includes(search));

      const start = (page - 1) * limit;

      return HttpResponse.json<SubjectsListResponse>({
        institute,
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: institute.subjectCount,
          totalPages: Math.max(1, Math.ceil(institute.subjectCount / limit)),
        },
        courses: ['1-kurs', '2-kurs', '3-kurs', '4-kurs'],
      });
    }),

    http.get(path(`admin/subject-requests`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
      const institute = url.searchParams.get('institute') ?? 'all';
      const status = url.searchParams.get('status') ?? 'all';
      const tab = url.searchParams.get('tab') ?? 'all';

      let filtered: SubjectRequest[] = mockSubjectRequests;

      // Tab filtri statusdan alohida: dizaynda ular mustaqil boshqariladi.
      if (tab === 'pending') {
        filtered = filtered.filter(
          (item) => item.status === 'Kutilmoqda' || item.status === 'Tasdiqlashda',
        );
      } else if (tab === 'rejected') {
        filtered = filtered.filter((item) => item.status === 'Rad etilgan');
      }

      if (institute !== 'all') {
        filtered = filtered.filter((item) => item.institute.short === institute);
      }
      if (status !== 'all') filtered = filtered.filter((item) => item.status === status);
      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.institute.name.toLowerCase().includes(search) ||
            item.requester.name.toLowerCase().includes(search),
        );
      }

      const start = (page - 1) * limit;

      return HttpResponse.json<SubjectRequestsListResponse>({
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
        institutes: instituteSummaries.map((item) => item.short),
      });
    }),

    http.get(path(`admin/institutes`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
      const region = url.searchParams.get('region') ?? 'all';
      const status = url.searchParams.get('status') ?? 'all';

      let filtered: Institute[] = mockInstitutes;

      if (region !== 'all') filtered = filtered.filter((item) => item.region === region);
      if (status !== 'all') filtered = filtered.filter((item) => item.status === status);
      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(search) || item.short.toLowerCase().includes(search),
        );
      }

      const start = (page - 1) * limit;

      return HttpResponse.json<InstitutesListResponse>({
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: 128,
          totalPages: Math.max(1, Math.ceil(128 / limit)),
        },
        regions,
      });
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
    http.get(path(`admin/freelancer-applications/:id`), async ({ params }) => {
      await delay(LATENCY_MS);

      const found = mockApplications.find((item) => item.id === params.id);
      if (!found) {
        return HttpResponse.json({ message: 'Ariza topilmadi' }, { status: 404 });
      }

      // Batafsil ma'lumot faqat bitta namuna uchun to'liq yozilgan;
      // qolganlari uchun ro'yxatdagi qiymatlar bilan to'ldiriladi.
      return HttpResponse.json<ApplicationDetail>({
        ...mockApplicationDetail,
        id: found.id,
        displayId: found.displayId,
        status: found.status,
        name: found.userName,
        phone: found.phone,
        university: {
          short: found.university,
          full: mockApplicationDetail.university.full,
        },
        personal: {
          ...mockApplicationDetail.personal,
          fullName: found.userName,
          phone: found.phone,
        },
      });
    }),

    http.get(path(`admin/freelancer-applications`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '20');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
      const status = url.searchParams.get('status') ?? 'all';
      const university = url.searchParams.get('university') ?? 'all';
      const speciality = url.searchParams.get('speciality') ?? 'all';

      let filtered: FreelancerApplication[] = mockApplications;

      if (status !== 'all') {
        filtered = filtered.filter((item) => item.status === (status as ApplicationStatus));
      }
      if (university !== 'all') {
        filtered = filtered.filter((item) => item.university === university);
      }
      if (speciality !== 'all') {
        filtered = filtered.filter((item) => item.speciality === speciality);
      }
      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.userName.toLowerCase().includes(search) ||
            item.phone.includes(search) ||
            item.university.toLowerCase().includes(search) ||
            item.displayId.toLowerCase().includes(search),
        );
      }

      const start = (page - 1) * limit;

      return HttpResponse.json<ApplicationsListResponse>({
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
        stats: {
          total: 248,
          totalPercent: '100%',
          pending: 86,
          pendingPercent: '34.7%',
          approved: 128,
          approvedPercent: '51.6%',
          rejected: 34,
          rejectedPercent: '13.7%',
        },
        filters: { universities, specialities },
      });
    }),

    http.get(path(`admin/freelancers`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '20');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
      const status = url.searchParams.get('status') ?? 'all';
      const speciality = url.searchParams.get('speciality') ?? 'all';
      const institute = url.searchParams.get('institute') ?? 'all';
      const sortBy = url.searchParams.get('sortBy') ?? '';
      const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

      let filtered: Freelancer[] = mockFreelancers;

      if (status !== 'all') {
        filtered = filtered.filter((item) => item.status === (status as FreelancerStatus));
      }
      if (speciality !== 'all') {
        filtered = filtered.filter((item) => item.speciality === speciality);
      }
      if (institute !== 'all') {
        filtered = filtered.filter((item) => item.institute === institute);
      }
      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(search) ||
            item.phone.includes(search) ||
            item.displayId.toLowerCase().includes(search) ||
            item.speciality.toLowerCase().includes(search),
        );
      }

      if (sortBy) {
        const direction = sortOrder === 'asc' ? 1 : -1;
        filtered = [...filtered].sort((a, b) => {
          if (sortBy === 'rating') return (a.rating - b.rating) * direction;
          if (sortBy === 'completedJobs') return (a.completedJobs - b.completedJobs) * direction;
          if (sortBy === 'income') return (a.income - b.income) * direction;
          return 0;
        });
      }

      const start = (page - 1) * limit;

      return HttpResponse.json<FreelancersListResponse>({
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
        stats: {
          total: 1248,
          totalDeltaThisMonth: 32,
          active: 1102,
          activePercent: '88.3%',
          temporarilyBlocked: 86,
          temporarilyBlockedPercent: '6.9%',
          blocked: 60,
          blockedPercent: '4.8%',
        },
        filters: { specialities, institutes },
      });
    }),

    http.get(path(`dashboard`), async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json<DashboardData>(mockDashboard);
    }),

    /*
     * Auth handler'lari OLIB TASHLANDI — kirish endi haqiqiy backendga
     * ketadi (`/api/v1/auth/login/`). Ular qolganda mock soxta token
     * qaytarib, moderatsiya endpoint'lari 401 bilan yiqilardi.
     *
     * Diqqat: mock yo'llari oxirida slash yo'q (`auth/login`), haqiqiy
     * backendniki bor (`auth/login/`) — shu sababli ular baribir
     * to'qnashmasdi, lekin ikki xil "kirish" bo'lishi chalkashtirardi.
     */

    http.get(path(`users`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '10');
      const search = url.searchParams.get('search')?.toLowerCase() ?? '';

      const filtered = search
        ? mockUsers.filter(
            (user) =>
              user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search),
          )
        : mockUsers;

      return HttpResponse.json<Paginated<User>>(paginate(filtered, page, limit));
    }),

    http.get(path(`users/:id`), async ({ params }) => {
      await delay(LATENCY_MS);

      const user = mockUsers.find((candidate) => candidate.id === params.id);
      if (!user) {
        return HttpResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });
      }

      return HttpResponse.json<User>(user);
    }),
  ];
}
