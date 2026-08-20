/**
 * Rollar va ruxsatlar — HAQIQIY backend (`/admin/roles/`, `/me/permissions/`).
 *
 * Ruxsat kalitlari frontendda QO'LDA YOZILMAYDI: ular
 * `/admin/roles/permissions/` dan keladi. Sabab backend hujjatida
 * aytilgan — shunda backendda yangi ruxsat paydo bo'lsa, u ikkinchi
 * deploysiz ham katakcha bo'lib chiqadi va aksincha, hech narsa
 * tekshirmaydigan ruxsat uchun katakcha paydo bo'lib qolmaydi.
 *
 * Yagona istisno — `PermissionCode`: bu kalitlar kod ichida menyu va
 * tugmalarni yashirish uchun ishlatiladi, shuning uchun ular tip
 * darajasida ma'lum bo'lishi kerak.
 */

export const PERMISSION_CODES = [
  'dashboard.view',
  'content.view',
  'users.view',
  'users.manage',
  'freelancers.view',
  'freelancers.moderate',
  'applications.view',
  'applications.review',
  'exchange.view',
  'exchange.refund',
  'catalogue.view',
  'catalogue.manage',
  'catalogue_requests.view',
  'catalogue_requests.review',
  'solutions.view',
  'solutions.moderate',
  'reports.view',
  'reports.review',
  'wallets.view',
  'wallets.adjust',
  'wallets.freeze',
  'withdrawals.view',
  'withdrawals.process',
  'appeals.view',
  'appeals.reply',
  'audit.view',
  'roles.manage',
] as const;
export type PermissionCode = (typeof PERMISSION_CODES)[number];

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  /**
   * Tizim roli — tahrirlab ham, o'chirib ham bo'lmaydi. Backend izohi:
   * hamma narsani beradigan va o'z egasi tomonidan o'chiriladigan rol —
   * jamoani panelidan mahrum qilishning yo'li.
   */
  is_system: boolean;
  user_count: number;
  created_at: string;
}

export interface RoleWriteRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface PermissionItem {
  code: string;
  label: string;
  /**
   * `false` — bu ruxsat faqat menyu bandini yashiradi, ortidagi
   * ma'lumot baribir ochiq. Muharrirda shuni aytib turish kerak,
   * aks holda u nimadir himoyalayotgandek ko'rinadi.
   */
  enforced: boolean;
}

export interface PermissionCatalogue {
  group: string;
  permissions: PermissionItem[];
}

/** Panel ishga tushganda bir marta so'raladigan yagona javob. */
export interface MyPermissions {
  is_staff: boolean;
  is_superuser: boolean;
  roles: string[];
  permissions: string[];
}

export interface RolesQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}
