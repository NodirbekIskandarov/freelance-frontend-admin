import {
  BarChart3,
  Building2,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  House,
  Landmark,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  /** Yo'q bo'lsa — element faqat ochiladigan guruh (children bilan). */
  to?: string;
  icon: LucideIcon;
  /** O'ngdagi son (dizaynning 16–18-rasmlaridagi variantida ishlatiladi). */
  badge?: number;
  children?: { label: string; to: string }[];
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
      { label: 'Dashboard', to: '/dashboard', icon: House },
      { label: 'Foydalanuvchilar', to: '/foydalanuvchilar', icon: Users },
      { label: 'Freelancerlar', to: '/freelancerlar', icon: UserRound },
      { label: 'Freelancer arizalari', to: '/freelancer-arizalari', icon: FileText },
    ],
  },
  {
    title: 'Tayyor materiallar',
    items: [
      { label: 'Kontent boshqaruvi', to: '/kontent', icon: Landmark },
      {
        label: 'Institutlar',
        icon: Building2,
        children: [
          { label: "Institutlar ro'yxati", to: '/institutlar' },
          { label: "Institut qo'shish arizalari", to: '/institutlar/arizalar' },
        ],
      },
      {
        label: 'Fanlar',
        icon: LayoutGrid,
        children: [
          { label: "Institutlar bo'yicha fanlar", to: '/fanlar' },
          { label: "Fan qo'shish arizalari", to: '/fanlar/arizalar' },
        ],
      },
      { label: 'Topshiriqlar', to: '/topshiriqlar', icon: ClipboardList },
      { label: 'Variantlar', to: '/variantlar', icon: ShieldCheck },
      { label: 'Yuborilgan institutlar', to: '/yuborilgan/institutlar', icon: ClipboardCheck },
      { label: 'Yuborilgan fanlar', to: '/yuborilgan/fanlar', icon: ClipboardCheck },
      { label: 'Yuborilgan topshiriqlar', to: '/yuborilgan/topshiriqlar', icon: ClipboardCheck },
      { label: 'Yuborilgan javoblar', to: '/yuborilgan/javoblar', icon: ClipboardCheck },
      { label: 'Yechim moderatsiyasi', to: '/yechimlar', icon: FileCheck2 },
      { label: 'Tasdiqlangan kontent', to: '/tasdiqlangan-kontent', icon: CheckSquare },
      { label: 'Sotuv statistikasi', to: '/sotuv-statistikasi', icon: BarChart3 },
    ],
  },
  {
    title: 'Sozlamalar',
    items: [
      { label: 'Sozlamalar', to: '/sozlamalar', icon: Settings },
      { label: 'Chiqish', to: '/logout', icon: LogOut },
    ],
  },
];
