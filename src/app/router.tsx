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

const ApplicationsPage = lazy(async () => ({
  default: (await import('@/features/applications/ApplicationsPage')).ApplicationsPage,
}));

const ApplicationDetailPage = lazy(async () => ({
  default: (await import('@/features/applications/ApplicationDetailPage')).ApplicationDetailPage,
}));

const ContentPage = lazy(async () => ({
  default: (await import('@/features/content/ContentPage')).ContentPage,
}));

const InstitutesPage = lazy(async () => ({
  default: (await import('@/features/institutes/InstitutesPage')).InstitutesPage,
}));

const InstituteRequestsPage = lazy(async () => ({
  default: (await import('@/features/institutes/InstituteRequestsPage')).InstituteRequestsPage,
}));

const SubjectsPage = lazy(async () => ({
  default: (await import('@/features/subjects/SubjectsPage')).SubjectsPage,
}));

const SubjectRequestsPage = lazy(async () => ({
  default: (await import('@/features/subjects/SubjectRequestsPage')).SubjectRequestsPage,
}));

const AssignmentsPage = lazy(async () => ({
  default: (await import('@/features/assignments/AssignmentsPage')).AssignmentsPage,
}));

const AssignmentDetailPage = lazy(async () => ({
  default: (await import('@/features/assignments/AssignmentDetailPage')).AssignmentDetailPage,
}));

const SubmissionsPage = lazy(async () => ({
  default: (await import('@/features/submissions/SubmissionsPage')).SubmissionsPage,
}));

const SubmissionDetailPage = lazy(async () => ({
  default: (await import('@/features/submissions/SubmissionDetailPage')).SubmissionDetailPage,
}));

const SolutionsPage = lazy(async () => ({
  default: (await import('@/features/solutions/SolutionsPage')).SolutionsPage,
}));

const SolutionDetailPage = lazy(async () => ({
  default: (await import('@/features/solutions/SolutionDetailPage')).SolutionDetailPage,
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
      { path: 'freelancer-arizalari', element: <ApplicationsPage /> },
      { path: 'freelancer-arizalari/:id', element: <ApplicationDetailPage /> },

      { path: 'kontent', element: <ContentPage /> },
      { path: 'institutlar', element: <InstitutesPage /> },
      { path: 'institutlar/arizalar', element: <InstituteRequestsPage /> },
      { path: 'fanlar', element: <SubjectsPage /> },
      { path: 'fanlar/arizalar', element: <SubjectRequestsPage /> },
      { path: 'topshiriqlar', element: <AssignmentsPage /> },
      { path: 'topshiriqlar/:id', element: <AssignmentDetailPage /> },
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
      { path: 'yuborilgan/javoblar', element: <SubmissionsPage /> },
      {
        path: 'yuborilgan/javoblar/:instituteId/:subjectId',
        element: <SubmissionDetailPage />,
      },

      { path: 'yechimlar', element: <SolutionsPage /> },
      { path: 'yechimlar/:id', element: <SolutionDetailPage /> },

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
