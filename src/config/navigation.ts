import {
  Activity,
  BanknoteArrowDown,
  Gavel,
  Receipt,
  BarChart3,
  Building2,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  Handshake,
  House,
  KeyRound,
  Landmark,
  LayoutGrid,
  Tags,
  LifeBuoy,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
  UserRound,
  Users,
  Wallet as WalletIcon,
} from 'lucide-react';

import type { Messages } from '@/i18n/messages/uz';
import type { PermissionCode } from '@/shared/types/adminRoles';

export interface NavItem {
  /**
   * Yorliq TARJIMADAN olinadi.
   *
   * Ro'yxat modul yuklanganda bir marta tuziladi va o'sha paytda qaysi
   * til tanlanganini bilib bo'lmaydi — shuning uchun matn emas, lug'atdan
   * tanlab oladigan funksiya.
   */
  label: (messages: Messages) => string;
  /** Yo'q bo'lsa — element faqat ochiladigan guruh (children bilan). */
  to?: string;
  icon: LucideIcon;
  /**
   * Ish navbati sonini qaysi kalitdan olish. Sonning O'ZI emas: ro'yxat
   * modul yuklanganda tuziladi, son esa serverdan keyin keladi.
   */
  queue?: 'solutions' | 'subjectRequests' | 'assignmentRequests' | 'reports' | 'disputes';
  /**
   * Shu band ko'rinishi uchun kerakli ruxsat. Ko'rsatilmagan band
   * hammaga ochiq (masalan "Chiqish"). Kalitlar `/me/permissions/`
   * dagilar bilan bir xil.
   */
  permission?: PermissionCode;
  children?: {
    label: (messages: Messages) => string;
    to: string;
    permission?: PermissionCode;
  }[];
}

export interface NavGroup {
  /**
   * Barqaror identifikator — ochiq/yopiq holati shu kalit bilan
   * saqlanadi. Sarlavha tarjimadan keladi va til almashganda o'zgaradi,
   * ya'ni uni kalit sifatida ishlatib bo'lmasdi.
   */
  id: string;
  /** Kichik uppercase sarlavha. */
  title: (messages: Messages) => string;
  /**
   * Ish navbati soni qaysi maydondan olinishi. Ko'rsatilmagan bandda
   * badge chizilmaydi; nol bo'lsa ham chizilmaydi — «0» ish emas.
   */
  items: NavItem[];
}

/**
 * Sidebar tuzilishi bitta joyda.
 *
 * Dizaynda sidebar ikki xil variantda chizilgan (1–15 va 16–18-rasmlar).
 * Bu yerdagi ro'yxat — 1–15 varianti, chunki barcha berilgan sahifalarni
 * qamrab oladi. Ikkinchi variantga o'tish shu faylni almashtirish bilan
 * bo'ladi: `Sidebar` komponenti tuzilishga emas, shakliga bog'liq.
 */
export const navigation: NavGroup[] = [
  {
    id: 'home',
    title: (m) => m.nav.groupHome,
    items: [
      {
        label: (m) => m.nav.dashboard,
        to: '/dashboard',
        icon: House,
        permission: 'dashboard.view',
      },
    ],
  },
  {
    id: 'people',
    title: (m) => m.nav.groupPeople,
    items: [
      { label: (m) => m.nav.users, to: '/foydalanuvchilar', icon: Users, permission: 'users.view' },
      {
        label: (m) => m.nav.freelancers,
        to: '/freelancerlar',
        icon: UserRound,
        permission: 'freelancers.view',
      },
      {
        label: (m) => m.nav.applications,
        to: '/freelancer-arizalari',
        icon: FileText,
        permission: 'applications.view',
      },
      {
        label: (m) => m.nav.staff,
        to: '/sozlamalar/adminlar',
        icon: ShieldCheck,
        // Menyuda `roles.manage` bilan ko'rinadi, ekranning o'zi esa
        // superuserni talab qiladi va sababini aytadi. Ikkalasi ham
        // kerak: menyuni ruxsat boshqaradi, qarorni superuser.
        permission: 'roles.manage',
      },
    ],
  },
  {
    id: 'content',
    title: (m) => m.nav.groupContent,
    items: [
      { label: (m) => m.nav.content, to: '/kontent', icon: Landmark, permission: 'content.view' },
      {
        label: (m) => m.nav.institutes,
        to: '/institutlar',
        icon: Building2,
        permission: 'catalogue.view',
      },
      /*
       * Fan arizalari alohida band emas: ularga fanlar ekranining o'z
       * tugmasi orqali o'tiladi. Menyuda ikkiga bo'lish bitta ish
       * oqimini ikki joyga uzoqlashtirardi.
       */
      {
        label: (m) => m.nav.subjects,
        to: '/fanlar',
        icon: LayoutGrid,
        permission: 'catalogue.view',
      },
      /*
       * Fan toifalari — ALOHIDA band, institutlar ostida emas.
       *
       * Toifa universitetning yo'nalishi emas: u butun katalog uchun
       * bitta. Uni institutlar ichiga yashirish aynan shu chalkashlikni
       * qayta tug'dirardi.
       */
      {
        label: (m) => m.nav.subjectCategories,
        to: '/fan-toifalari',
        icon: Tags,
        permission: 'catalogue.view',
      },
      {
        label: (m) => m.nav.assignments,
        to: '/topshiriqlar',
        icon: ClipboardList,
        permission: 'catalogue.view',
      },
      {
        label: (m) => m.nav.variants,
        to: '/variantlar',
        icon: ShieldCheck,
        permission: 'catalogue.view',
      },
      {
        label: (m) => m.nav.comments,
        to: '/izohlar',
        icon: MessageSquare,
        permission: 'catalogue.view',
      },
    ],
  },
  {
    id: 'moderation',
    title: (m) => m.nav.groupModeration,
    items: [
      {
        label: (m) => m.nav.solutionModeration,
        to: '/yechimlar',
        icon: FileCheck2,
        permission: 'solutions.view',
        queue: 'solutions',
      },
      {
        label: (m) => m.nav.submittedSubjects,
        to: '/yuborilgan/fanlar',
        icon: ClipboardCheck,
        permission: 'catalogue_requests.view',
        queue: 'subjectRequests',
      },
      {
        label: (m) => m.nav.submittedSolutions,
        to: '/yuborilgan/javoblar',
        icon: ClipboardCheck,
        permission: 'solutions.view',
      },
      {
        label: (m) => m.nav.approvedContent,
        to: '/tasdiqlangan-kontent',
        icon: CheckSquare,
        permission: 'solutions.view',
      },
    ],
  },
  {
    id: 'complaints',
    title: (m) => m.nav.groupComplaints,
    items: [
      {
        label: (m) => m.nav.reports,
        to: '/shikoyatlar',
        icon: TriangleAlert,
        permission: 'reports.view',
        queue: 'reports',
      },
      {
        label: (m) => m.nav.purchaseDisputes,
        to: '/xarid-shikoyatlari',
        icon: Gavel,
        permission: 'reports.view',
        queue: 'disputes',
      },
      {
        label: (m) => m.nav.appeals,
        to: '/murojaatlar',
        icon: LifeBuoy,
        permission: 'appeals.view',
      },
    ],
  },
  {
    id: 'finance',
    title: (m) => m.nav.groupFinance,
    items: [
      {
        label: (m) => m.nav.wallets,
        to: '/hamyonlar',
        icon: WalletIcon,
        permission: 'wallets.view',
      },
      {
        label: (m) => m.nav.withdrawals,
        to: '/pul-yechish',
        icon: BanknoteArrowDown,
        permission: 'withdrawals.view',
      },
      {
        label: (m) => m.nav.ledger,
        to: '/pul-harakati',
        icon: Receipt,
        permission: 'wallets.view',
      },
      {
        label: (m) => m.nav.salesStats,
        to: '/sotuv-statistikasi',
        icon: BarChart3,
        permission: 'content.view',
      },
      { label: (m) => m.nav.exchange, to: '/birja', icon: Handshake, permission: 'exchange.view' },
    ],
  },
  {
    id: 'system',
    title: (m) => m.nav.groupSystem,
    items: [
      {
        label: (m) => m.nav.monitoring,
        to: '/monitoring',
        icon: Activity,
        permission: 'dashboard.view',
      },
      { label: (m) => m.nav.audit, to: '/audit', icon: ScrollText, permission: 'audit.view' },
      { label: (m) => m.nav.roles, to: '/rollar', icon: KeyRound, permission: 'roles.manage' },
      { label: (m) => m.nav.settings, to: '/sozlamalar', icon: Settings },
      // «Chiqish» yo'q: u `/logout` ga olib borardi va bunday sahifa
      // umuman yo'q edi. Chiqish yuqori o'ngdagi profil menyusida.
    ],
  },
];
