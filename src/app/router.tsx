import { lazy, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, useLocation, useParams } from 'react-router';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { DEFAULT_LOCALE, detectLocale, isLocale, localizeHref } from '@/i18n/config';
import { I18nProvider } from '@/i18n/I18nProvider';
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
const ProfilePage = lazy(async () => ({
  default: (await import('@/features/profile/ProfilePage')).ProfilePage,
}));

const StaffPage = lazy(async () => ({
  default: (await import('@/features/staff/StaffPage')).StaffPage,
}));

const UserDetailPage = lazy(async () => ({
  default: (await import('@/features/users/UserDetailPage')).UserDetailPage,
}));

const CommentsPage = lazy(async () => ({
  default: (await import('@/features/comments/CommentsPage')).CommentsPage,
}));

const MonitoringPage = lazy(async () => ({
  default: (await import('@/features/monitoring/MonitoringPage')).MonitoringPage,
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

/**
 * Tilsiz manzilni tilga ko'chiradi va yo'lni SAQLAB qoladi.
 *
 * `/dashboard?page=3` → `/uz/dashboard?page=3`. Bosh sahifaga otib
 * yuborish odamning qayerga ketayotganini yo'qotardi.
 */
function LocaleRedirect() {
  const { pathname, search, hash } = useLocation();
  const locale = detectLocale();

  return <Navigate to={`${localizeHref(pathname, locale)}${search}${hash}`} replace />;
}

/**
 * Birinchi bo'lak HAQIQATAN til ekanini tekshiradi.
 *
 * `:locale` istalgan bo'lakka mos keladi, ya'ni eski havola
 * (`/foydalanuvchilar`) ham shu shoxga tushardi va `foydalanuvchilar`
 * til deb qabul qilinardi — natijada sahifa topilmasdi. Bu yerda
 * bunday manzil butunlay tilga ko'chiriladi: `/uz/foydalanuvchilar`.
 */
function LocaleGuard({ children }: { children: ReactNode }) {
  const params = useParams();

  if (!isLocale(params.locale)) return <LocaleRedirect />;

  return <I18nProvider>{children}</I18nProvider>;
}

/** Til bo'lagini saqlagan holda ichki manzilga o'tish. */
function LocaleNavigate({ to }: { to: string }) {
  const params = useParams();
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  return <Navigate to={localizeHref(to, locale)} replace />;
}

/**
 * Til manzilning birinchi bo'lagida: `/uz/dashboard`, `/ru/dashboard`.
 *
 * Tilsiz manzil (eski xatcho'p, qo'lda yozilgan yo'l) aniqlangan tilga
 * yo'naltiriladi — `LocaleRedirect`. Usiz eski havolalar 404 berardi.
 */
export const router = createBrowserRouter([
  { path: '/', element: <LocaleRedirect /> },

  {
    path: '/:locale/login',
    element: (
      <LocaleGuard>
        <LoginPage />
      </LocaleGuard>
    ),
  },
  {
    path: '/:locale',
    element: (
      <LocaleGuard>
        <AdminLayout />
      </LocaleGuard>
    ),
    children: [
      { index: true, element: <LocaleNavigate to="/dashboard" /> },

      { path: 'dashboard', element: gated('dashboard.view', <DashboardPage />) },

      { path: 'foydalanuvchilar', element: gated('users.view', <UsersPage />) },
      { path: 'foydalanuvchilar/:id', element: gated('users.view', <UserDetailPage />) },
      // Profil ruxsat talab qilmaydi: har kim o'zinikini ko'radi.
      { path: 'profil', element: <ProfilePage /> },
      // Ekranning o'zi superuserni tekshiradi va sababini aytadi —
      // `gated` bilan o'ralsa manzilni yozgan odam bo'sh sahifa ko'rardi.
      { path: 'sozlamalar/adminlar', element: <StaffPage /> },
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
      { path: 'monitoring', element: gated('dashboard.view', <MonitoringPage />) },
      { path: 'shikoyatlar', element: gated('reports.view', <SolutionReportsPage />) },

      { path: 'yechimlar', element: gated('solutions.view', <SolutionsPage />) },
      { path: 'yechimlar/:id', element: gated('solutions.view', <SolutionDetailPage />) },

      { path: 'tasdiqlangan-kontent', element: <PlaceholderPage title="Tasdiqlangan kontent" /> },
      { path: 'sotuv-statistikasi', element: <PlaceholderPage title="Sotuv statistikasi" /> },
      { path: 'audit', element: gated('audit.view', <AuditPage />) },
      { path: 'rollar', element: gated('roles.manage', <RolesPage />) },
      { path: 'sozlamalar', element: <PlaceholderPage title="Sozlamalar" /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
  /*
   * Tilsiz qolgan har qanday yo'l — eski havola. Uni 404 qilish o'rniga
   * o'sha yo'lni tilga ko'chiramiz: `/dashboard` → `/uz/dashboard`.
   * Til bo'lagi bor, lekin sahifa yo'q bo'lsa `AdminLayout` ichidagi
   * `*` uni tutadi.
   */
  { path: '*', element: <LocaleRedirect /> },
]);
