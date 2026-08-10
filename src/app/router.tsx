import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UsersPage } from '@/pages/UsersPage';

/**
 * Marshrutlar bir joyda. Sahifalar ko'paygach `lazy` bilan
 * bo'lib yuboriladi — hozircha bundle kichik, kerak emas.
 *
 * Auth guard (`ProtectedRoute`) login endpoint'i aniq bo'lgach qo'shiladi.
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
