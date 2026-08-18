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
  default: (await import('@/features/adminFreelance/FreelancersPage')).FreelancersPage,
}));

const ApplicationsPage = lazy(async () => ({
  default: (await import('@/features/adminFreelance/ApplicationsPage')).ApplicationsPage,
}));

const ContentPage = lazy(async () => ({
  default: (await import('@/features/content/ContentPage')).ContentPage,
}));

const InstitutesPage = lazy(async () => ({
  default: (await import('@/features/catalogue/InstitutesPage')).InstitutesPage,
}));

const InstituteRequestsPage = lazy(async () => ({
  default: (await import('@/features/institutes/InstituteRequestsPage')).InstituteRequestsPage,
}));

const SubjectsPage = lazy(async () => ({
  default: (await import('@/features/catalogue/SubjectsPage')).SubjectsPage,
}));

const SubjectRequestsPage = lazy(async () => ({
  default: (await import('@/features/adminRequests/SubjectRequestsPage')).SubjectRequestsPage,
}));

const AssignmentRequestsPage = lazy(async () => ({
  default: (await import('@/features/adminRequests/AssignmentRequestsPage')).AssignmentRequestsPage,
}));

const SolutionReportsPage = lazy(async () => ({
  default: (await import('@/features/adminRequests/SolutionReportsPage')).SolutionReportsPage,
}));

const AssignmentsPage = lazy(async () => ({
  default: (await import('@/features/assignments/AssignmentsPage')).AssignmentsPage,
}));

const AssignmentDetailPage = lazy(async () => ({
  default: (await import('@/features/assignments/AssignmentDetailPage')).AssignmentDetailPage,
}));

const VariantsPage = lazy(async () => ({
  default: (await import('@/features/assignments/VariantsPage')).VariantsPage,
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

const ExchangeTasksPage = lazy(async () => ({
  default: (await import('@/features/adminExchange/ExchangeTasksPage')).ExchangeTasksPage,
}));

const AppealsPage = lazy(async () => ({
  default: (await import('@/features/adminAppeals/AppealsPage')).AppealsPage,
}));

const WalletsPage = lazy(async () => ({
  default: (await import('@/features/adminWallet/WalletsPage')).WalletsPage,
}));

const WithdrawalsPage = lazy(async () => ({
  default: (await import('@/features/adminWallet/WithdrawalsPage')).WithdrawalsPage,
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
      { path: 'birja', element: <ExchangeTasksPage /> },
      { path: 'murojaatlar', element: <AppealsPage /> },
      { path: 'hamyonlar', element: <WalletsPage /> },
      { path: 'pul-yechish', element: <WithdrawalsPage /> },

      { path: 'kontent', element: <ContentPage /> },
      { path: 'institutlar', element: <InstitutesPage /> },
      { path: 'institutlar/arizalar', element: <InstituteRequestsPage /> },
      { path: 'fanlar', element: <SubjectsPage /> },
      { path: 'fanlar/arizalar', element: <SubjectRequestsPage /> },
      { path: 'topshiriqlar', element: <AssignmentsPage /> },
      { path: 'topshiriqlar/:id', element: <AssignmentDetailPage /> },
      { path: 'variantlar', element: <VariantsPage /> },

      {
        path: 'yuborilgan/institutlar',
        element: <PlaceholderPage title="Yuborilgan institutlar" />,
      },
      { path: 'yuborilgan/fanlar', element: <PlaceholderPage title="Yuborilgan fanlar" /> },
      { path: 'yuborilgan/topshiriqlar', element: <AssignmentRequestsPage /> },
      { path: 'yuborilgan/javoblar', element: <SubmissionsPage /> },
      {
        path: 'yuborilgan/javoblar/:instituteId/:subjectId',
        element: <SubmissionDetailPage />,
      },

      { path: 'shikoyatlar', element: <SolutionReportsPage /> },

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
