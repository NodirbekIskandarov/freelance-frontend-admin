import {
  Activity,
  BanknoteArrowDown,
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
  LifeBuoy,
  LogOut,
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

import type { PermissionCode } from '@/shared/types/adminRoles';

export interface NavItem {
  label: string;
  /** Yo'q bo'lsa — element faqat ochiladigan guruh (children bilan). */
  to?: string;
  icon: LucideIcon;
  /** O'ngdagi son (dizaynning 16–18-rasmlaridagi variantida ishlatiladi). */
  badge?: number;
  /**
   * Shu band ko'rinishi uchun kerakli ruxsat. Ko'rsatilmagan band
   * hammaga ochiq (masalan "Chiqish"). Kalitlar `/me/permissions/`
   * dagilar bilan bir xil.
   */
  permission?: PermissionCode;
  children?: { label: string; to: string; permission?: PermissionCode }[];
}

export interface NavGroup {
  /** Kichik uppercase sarlavha. Bo'sh bo'lsa sarlavhasiz guruh. */
  title: string;
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
    title: 'Bosh sahifa',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: House, permission: 'dashboard.view' },
      { label: 'Foydalanuvchilar', to: '/foydalanuvchilar', icon: Users, permission: 'users.view' },
      {
        label: 'Freelancerlar',
        to: '/freelancerlar',
        icon: UserRound,
        permission: 'freelancers.view',
      },
      {
        label: 'Freelancer arizalari',
        to: '/freelancer-arizalari',
        icon: FileText,
        permission: 'applications.view',
      },
      { label: 'Birja nazorati', to: '/birja', icon: Handshake, permission: 'exchange.view' },
      { label: 'Murojaatlar', to: '/murojaatlar', icon: LifeBuoy, permission: 'appeals.view' },
    ],
  },
  {
    title: 'Tayyor materiallar',
    items: [
      { label: 'Kontent boshqaruvi', to: '/kontent', icon: Landmark, permission: 'content.view' },
      { label: 'Institutlar', to: '/institutlar', icon: Building2, permission: 'catalogue.view' },
      /*
       * Bitta element: arizalar sahifasiga fanlar ekranining o'zidagi
       * tugma orqali o'tiladi. Menyuda ikkiga bo'lish ularni bir-biridan
       * uzoq ko'rsatardi, aslida esa bu bitta ish oqimi — fanni ko'rish,
       * yangisini qo'shish, kelgan arizani ko'rib chiqish.
       */
      { label: 'Fanlar', to: '/fanlar', icon: LayoutGrid, permission: 'catalogue.view' },
      {
        label: 'Topshiriqlar',
        to: '/topshiriqlar',
        icon: ClipboardList,
        permission: 'catalogue.view',
      },
      { label: 'Variantlar', to: '/variantlar', icon: ShieldCheck, permission: 'catalogue.view' },
      {
        label: 'Yuborilgan institutlar',
        to: '/yuborilgan/institutlar',
        icon: ClipboardCheck,
        permission: 'catalogue_requests.view',
      },
      {
        label: 'Yuborilgan fanlar',
        to: '/yuborilgan/fanlar',
        icon: ClipboardCheck,
        permission: 'catalogue_requests.view',
      },
      {
        label: 'Yuborilgan javoblar',
        to: '/yuborilgan/javoblar',
        icon: ClipboardCheck,
        permission: 'solutions.view',
      },
      {
        label: 'Yechim moderatsiyasi',
        to: '/yechimlar',
        icon: FileCheck2,
        permission: 'solutions.view',
      },
      {
        label: 'Izohlar',
        to: '/izohlar',
        icon: MessageSquare,
        permission: 'catalogue.view',
      },
      { label: 'Shikoyatlar', to: '/shikoyatlar', icon: TriangleAlert, permission: 'reports.view' },
      {
        label: 'Tasdiqlangan kontent',
        to: '/tasdiqlangan-kontent',
        icon: CheckSquare,
        permission: 'solutions.view',
      },
      {
        label: 'Server monitoringi',
        to: '/monitoring',
        icon: Activity,
        permission: 'dashboard.view',
      },
      {
        label: 'Sotuv statistikasi',
        to: '/sotuv-statistikasi',
        icon: BarChart3,
        permission: 'content.view',
      },
    ],
  },
  {
    title: 'Moliya',
    items: [
      { label: 'Hamyonlar', to: '/hamyonlar', icon: WalletIcon, permission: 'wallets.view' },
      {
        label: "Pul yechish so'rovlari",
        to: '/pul-yechish',
        icon: BanknoteArrowDown,
        permission: 'withdrawals.view',
      },
    ],
  },
  {
    title: 'Sozlamalar',
    items: [
      { label: 'Audit jurnali', to: '/audit', icon: ScrollText, permission: 'audit.view' },
      { label: 'Rollar va ruxsatlar', to: '/rollar', icon: KeyRound, permission: 'roles.manage' },
      { label: 'Sozlamalar', to: '/sozlamalar', icon: Settings },
      { label: 'Chiqish', to: '/logout', icon: LogOut },
    ],
  },
];
