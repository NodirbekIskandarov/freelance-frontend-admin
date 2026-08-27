import { lazy, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { RequirePermission } from '@/features/adminRoles/RequirePermission';
import type { PermissionCode } from '@/shared/types/adminRoles';
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
const CommentsPage = lazy(async () => ({
  default: (await import('@/features/comments/CommentsPage')).CommentsPage,
}));

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

const AuditPage = lazy(async () => ({
  default: (await import('@/features/adminAudit/AuditPage')).AuditPage,
}));

const RolesPage = lazy(async () => ({
  default: (await import('@/features/adminRoles/RolesPage')).RolesPage,
}));

/**
 * Sahifani ruxsat darvozasiga o'raydi.
 *
 * Menyuni yashirish yetarli emas: manzil qo'lda kiritilsa yoki eski
 * xatcho'p ochilsa, sahifa baribir chizilardi.
 */
function gated(permission: PermissionCode, element: ReactNode) {
  return <RequirePermission permission={permission}>{element}</RequirePermission>;
}

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

      { path: 'dashboard', element: gated('dashboard.view', <DashboardPage />) },

      { path: 'foydalanuvchilar', element: gated('users.view', <UsersPage />) },
      { path: 'freelancerlar', element: gated('freelancers.view', <FreelancersPage />) },
      { path: 'freelancer-arizalari', element: gated('applications.view', <ApplicationsPage />) },
      { path: 'birja', element: gated('exchange.view', <ExchangeTasksPage />) },
      { path: 'murojaatlar', element: gated('appeals.view', <AppealsPage />) },
      { path: 'hamyonlar', element: gated('wallets.view', <WalletsPage />) },
      { path: 'pul-yechish', element: gated('withdrawals.view', <WithdrawalsPage />) },

      { path: 'kontent', element: gated('content.view', <ContentPage />) },
      { path: 'institutlar', element: gated('catalogue.view', <InstitutesPage />) },
      { path: 'fanlar', element: gated('catalogue.view', <SubjectsPage />) },
      {
        path: 'fanlar/arizalar',
        element: gated('catalogue_requests.view', <SubjectRequestsPage />),
      },
      { path: 'topshiriqlar', element: gated('catalogue.view', <AssignmentsPage />) },
      {
        path: 'topshiriqlar/arizalar',
        element: gated('catalogue_requests.view', <AssignmentRequestsPage />),
      },
      { path: 'topshiriqlar/:id', element: gated('catalogue.view', <AssignmentDetailPage />) },
      { path: 'variantlar', element: gated('catalogue.view', <VariantsPage />) },

      {
        path: 'yuborilgan/institutlar',
        element: <PlaceholderPage title="Yuborilgan institutlar" />,
      },
      { path: 'yuborilgan/fanlar', element: <PlaceholderPage title="Yuborilgan fanlar" /> },
      { path: 'yuborilgan/javoblar', element: gated('solutions.view', <SubmissionsPage />) },
      {
        path: 'yuborilgan/javoblar/:subjectId',
        element: gated('solutions.view', <SubmissionDetailPage />),
      },

      { path: 'izohlar', element: gated('catalogue.view', <CommentsPage />) },
      { path: 'shikoyatlar', element: gated('reports.view', <SolutionReportsPage />) },

      { path: 'yechimlar', element: gated('solutions.view', <SolutionsPage />) },
      { path: 'yechimlar/:id', element: gated('solutions.view', <SolutionDetailPage />) },

      { path: 'tasdiqlangan-kontent', element: <PlaceholderPage title="Tasdiqlangan kontent" /> },
      { path: 'sotuv-statistikasi', element: <PlaceholderPage title="Sotuv statistikasi" /> },
      { path: 'audit', element: gated('audit.view', <AuditPage />) },
      { path: 'rollar', element: gated('roles.manage', <RolesPage />) },
      { path: 'sozlamalar', element: <PlaceholderPage title="Sozlamalar" /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
