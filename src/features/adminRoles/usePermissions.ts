import type { PermissionCode } from '@/shared/types/adminRoles';

import { useGetMyPermissionsQuery } from './adminRolesApi';

export interface PermissionGate {
  /** Ruxsat hali yuklanmagan — menyu va tugmalar chizilmasin. */
  isLoading: boolean;
  /** So'rov yiqildi — menyu bo'sh qolgani sababini aytish uchun. */
  isError: boolean;
  isSuperuser: boolean;
  roles: string[];
  can: (permission?: PermissionCode) => boolean;
}

/**
 * Panelning ruxsat darvozasi.
 *
 * `/me/permissions/` butun panel uchun BIR MARTA so'raladi — RTK Query
 * keshi takroriy chaqiruvlarni birlashtiradi, shuning uchun bu hook'ni
 * kerakli joyda bemalol chaqirish mumkin.
 *
 * Superuser hamma narsani ko'radi: backend unga alohida ro'yxat
 * bermasligi mumkin, `is_superuser` esa aynan shu ma'noni bildiradi.
 */
export function usePermissions(): PermissionGate {
  const { data, isLoading, isError } = useGetMyPermissionsQuery();

  const granted = data?.permissions ?? [];
  const isSuperuser = data?.is_superuser ?? false;

  return {
    isLoading,
    isError,
    isSuperuser,
    roles: data?.roles ?? [],
    /*
     * Ruxsat ko'rsatilmagan element HAMMAGA ochiq (masalan "Chiqish").
     * Yuklanayotganda `false`: ruxsatsiz menyu bandini bir zumga
     * ko'rsatib, keyin olib qo'yish yashirishdan yomonroq.
     */
    can: (permission) => {
      if (!permission) return true;
      if (isLoading) return false;
      return isSuperuser || granted.includes(permission);
    },
  };
}
