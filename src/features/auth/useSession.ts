import { useNavigate } from 'react-router';

import { usePermissions } from '@/features/adminRoles/usePermissions';

import { clearSession, readStoredUser, useLogoutMutation } from './authApi';
import { tokenStore } from '@/store/api';
import { useT } from '@/i18n/I18nProvider';

/**
 * Joriy seans: kim kirgan va qanday chiqish.
 *
 * Foydalanuvchi login javobidan saqlangan yozuvdan o'qiladi — backendda
 * "joriy foydalanuvchi" endpointi yo'q. Rollar esa `/me/permissions/`
 * dan keladi va u ruxsatning YAGONA manbai: saqlangan yozuv faqat
 * ko'rsatish uchun va uni brauzerda o'zgartirib bo'ladi.
 */
export function useSession() {
  const { m } = useT();
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();
  const { roles, isSuperuser } = usePermissions();

  const user = readStoredUser();

  async function signOut() {
    const refresh = tokenStore.getRefreshToken();

    /*
     * Server tokenni qora ro'yxatga qo'shadi. Yiqilsa ham davom etamiz:
     * odam chiqmoqchi bo'ldi va uni tarmoq xatosi sababli tizim ichida
     * ushlab turish — u kutgan narsaning aksi. Mahalliy token baribir
     * o'chiriladi, ya'ni bu qurilmada seans tugaydi.
     */
    if (refresh) {
      try {
        await logout({ refresh }).unwrap();
      } catch {
        // Jim o'tamiz — pastda mahalliy tozalash baribir bo'ladi.
      }
    }

    clearSession();
    // `replace` — «orqaga» tugmasi chiqqandan keyin panelga qaytarmasin.
    void navigate('/login', { replace: true });
  }

  return {
    user,
    roles,
    isSuperuser,
    /** Ko'rsatish uchun nom: to'liq ism yo'q, shuning uchun telefon/email. */
    displayName: user?.phone || user?.email || 'Admin',
    /* Rol nomi backenddan keladi va tarjima qilinmaydi; qolgan
       ikki holat esa interfeys matni. */
    roleLabel: isSuperuser ? m.layout.superAdmin : (roles[0] ?? m.layout.staffMember),
    signOut,
    isSigningOut: isLoading,
  };
}
