import { delay, http, HttpResponse } from 'msw';

import type { AuthTokens, LoginResponse, Paginated, User } from '../types/api';
import type { DashboardData } from '../types/dashboard';
import { mockDashboard } from './dashboard';
import { mockUsers } from './data';

// Yo'llar wildcard bilan boshlanadi — shunda handler baseUrl'dan qat'i nazar
// ishlaydi (web va admin turli portlarda, .env da manzil o'zgarishi mumkin).

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

export const handlers = [
  http.get('*/dashboard', async () => {
    await delay(LATENCY_MS);
    return HttpResponse.json<DashboardData>(mockDashboard);
  }),

  http.post('*/auth/login', async ({ request }) => {
    await delay(LATENCY_MS);

    const body = (await request.json()) as { email?: string; password?: string };
    const user = mockUsers.find((candidate) => candidate.email === body.email);

    if (!user || !body.password) {
      return HttpResponse.json(
        { message: 'Email yoki parol noto‘g‘ri' },
        { status: 401 },
      );
    }

    return HttpResponse.json<LoginResponse>({ ...tokens, user });
  }),

  http.post('*/auth/refresh', async () => {
    await delay(LATENCY_MS);
    return HttpResponse.json<AuthTokens>(tokens);
  }),

  http.get('*/auth/me', async () => {
    await delay(LATENCY_MS);
    const user = mockUsers[0];
    if (!user) {
      return HttpResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }
    return HttpResponse.json<User>(user);
  }),

  http.get('*/users', async ({ request }) => {
    await delay(LATENCY_MS);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '10');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? mockUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search),
        )
      : mockUsers;

    return HttpResponse.json<Paginated<User>>(paginate(filtered, page, limit));
  }),

  http.get('*/users/:id', async ({ params }) => {
    await delay(LATENCY_MS);

    const user = mockUsers.find((candidate) => candidate.id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    return HttpResponse.json<User>(user);
  }),
];
