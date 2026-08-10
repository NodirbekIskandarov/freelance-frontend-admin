import { delay, http, HttpResponse } from 'msw';

import type { AuthTokens, LoginResponse, Paginated, User } from '../types/api';
import type {
  ApplicationsListResponse,
  ApplicationStatus,
  FreelancerApplication,
} from '../types/applications';
import type { DashboardData } from '../types/dashboard';
import type { Freelancer, FreelancersListResponse, FreelancerStatus } from '../types/freelancers';
import type { AdminUser, UsersListResponse, UserStatus } from '../types/users';
import type { ApplicationDetail } from '../types/applicationDetail';
import type { ContentOverview } from '../types/content';
import { mockApplicationDetail } from './applicationDetail';
import { mockContentOverview } from './content';
import { mockApplications, universities } from './applications';
import { mockDashboard } from './dashboard';
import { mockUsers } from './data';
import { institutes, mockFreelancers, specialities } from './freelancers';
import { mockAdminUsers } from './users';

/** Tarmoq kechikishini taqlid qiladi — loading holatlari real ko'rinsin. */
const LATENCY_MS = 300;

const tokens: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

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

/** Ustun nomiga qarab saralaydi. Backend ham xuddi shunday qilishi kutiladi. */
function sortUsers(items: AdminUser[], sortBy: string, order: 'asc' | 'desc'): AdminUser[] {
  const direction = order === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    if (sortBy === 'balance') return (a.balance - b.balance) * direction;
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'uz') * direction;
    if (sortBy === 'registeredAt') return a.registeredAt.localeCompare(b.registeredAt) * direction;
    return 0;
  });
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

    http.get(path(`admin/users`), async ({ request }) => {
      await delay(LATENCY_MS);

      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const limit = Number(url.searchParams.get('limit') ?? '20');
      const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
      const status = url.searchParams.get('status') ?? 'all';
      const sortBy = url.searchParams.get('sortBy') ?? '';
      const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

      let filtered = mockAdminUsers;

      if (status !== 'all') {
        filtered = filtered.filter((user) => user.status === (status as UserStatus));
      }

      if (search) {
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search) ||
            user.phone.includes(search) ||
            user.displayId.toLowerCase().includes(search),
        );
      }

      if (sortBy) {
        filtered = sortUsers(filtered, sortBy, sortOrder);
      }

      const start = (page - 1) * limit;

      return HttpResponse.json<UsersListResponse>({
        items: filtered.slice(start, start + limit),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
        // Statistika dizayndagi qiymatlar — ular butun platforma bo'yicha,
        // filtrga bog'liq emas.
        stats: {
          total: 12_482,
          totalDeltaThisMonth: 245,
          addedToday: 56,
          addedTodayDelta: 12,
          active: 11_258,
          activePercent: '90.2%',
          blocked: 324,
          blockedPercent: '2.6%',
        },
      });
    }),

    http.post(path(`auth/login`), async ({ request }) => {
      await delay(LATENCY_MS);

      const body = (await request.json()) as { email?: string; password?: string };
      const user = mockUsers.find((candidate) => candidate.email === body.email);

      if (!user || !body.password) {
        return HttpResponse.json({ message: 'Email yoki parol noto‘g‘ri' }, { status: 401 });
      }

      return HttpResponse.json<LoginResponse>({ ...tokens, user });
    }),

    http.post(path(`auth/refresh`), async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json<AuthTokens>(tokens);
    }),

    http.get(path(`auth/me`), async () => {
      await delay(LATENCY_MS);
      const user = mockUsers[0];
      if (!user) {
        return HttpResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });
      }
      return HttpResponse.json<User>(user);
    }),

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
