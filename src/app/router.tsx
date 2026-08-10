import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

/**
 * Sahifalar `lazy` bilan yuklanadi.
 *
 * Sabab: Dashboard Recharts'ni tortadi (~400 kB). U asosiy bundle'da
 * bo'lsa, login sahifasini ochgan foydalanuvchi ham grafik kutubxonasini
 * yuklab olardi. Lazy qilinganda har sahifa o'z chunk'ida qoladi.
 */
const DashboardPage = lazy(async () => ({
  default: (await import('@/features/dashboard/DashboardPage')).DashboardPage,
}));

const UsersPage = lazy(async () => ({
  default: (await import('@/features/users/UsersPage')).UsersPage,
}));

const FreelancersPage = lazy(async () => ({
  default: (await import('@/features/freelancers/FreelancersPage')).FreelancersPage,
}));

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

      { path: 'foydalanuvchilar', element: <UsersPage /> },
      { path: 'freelancerlar', element: <FreelancersPage /> },
      { path: 'freelancer-arizalari', element: <PlaceholderPage title="Freelancer arizalari" /> },

      { path: 'kontent', element: <PlaceholderPage title="Kontent boshqaruvi" /> },
      { path: 'institutlar', element: <PlaceholderPage title="Institutlar" /> },
      {
        path: 'institutlar/arizalar',
        element: <PlaceholderPage title="Institut qo'shish arizalari" />,
      },
      { path: 'fanlar', element: <PlaceholderPage title="Fanlar" /> },
      { path: 'fanlar/arizalar', element: <PlaceholderPage title="Fan qo'shish arizalari" /> },
      { path: 'topshiriqlar', element: <PlaceholderPage title="Topshiriqlar" /> },
      { path: 'variantlar', element: <PlaceholderPage title="Variantlar" /> },

      {
        path: 'yuborilgan/institutlar',
        element: <PlaceholderPage title="Yuborilgan institutlar" />,
      },
      { path: 'yuborilgan/fanlar', element: <PlaceholderPage title="Yuborilgan fanlar" /> },
      {
        path: 'yuborilgan/topshiriqlar',
        element: <PlaceholderPage title="Yuborilgan topshiriqlar" />,
      },
      { path: 'yuborilgan/javoblar', element: <PlaceholderPage title="Yuborilgan javoblar" /> },

      { path: 'tasdiqlangan-kontent', element: <PlaceholderPage title="Tasdiqlangan kontent" /> },
      { path: 'sotuv-statistikasi', element: <PlaceholderPage title="Sotuv statistikasi" /> },
      { path: 'sozlamalar', element: <PlaceholderPage title="Sozlamalar" /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
