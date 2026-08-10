import type { User } from '../types/api';

/**
 * Soxta ma'lumotlar. Backend tayyor bo'lgach bu papka butunlay o'chiriladi.
 * Shakli `types/api.ts` bilan bir xil — shuning uchun real API'ga
 * o'tganda komponentlar o'zgarmaydi.
 */
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin Adminov',
    role: 'admin',
    avatarUrl: null,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: '2',
    email: 'dilnoza@example.com',
    name: 'Dilnoza Karimova',
    role: 'user',
    avatarUrl: null,
    createdAt: '2026-02-03T14:20:00.000Z',
  },
  {
    id: '3',
    email: 'jasur@example.com',
    name: 'Jasur Toshmatov',
    role: 'user',
    avatarUrl: null,
    createdAt: '2026-03-21T11:45:00.000Z',
  },
];
