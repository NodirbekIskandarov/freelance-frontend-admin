import { ShieldX } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import type { PermissionCode } from '@/shared/types/adminRoles';

import { usePermissions } from './usePermissions';

/**
 * Sahifa darajasidagi darvoza.
 *
 * Menyuni yashirish yetarli emas: manzilni qo'lda kiritish yoki eski
 * xatcho'p baribir sahifani ochardi. Bu — HIMOYA emas, xushmuomalalik:
 * haqiqiy tekshiruvni backend qiladi va ruxsatsiz so'rov 403 qaytaradi.
 * Bu yerdagi to'siq shunchaki bo'sh jadval va 403 xatolar o'rniga
 * tushunarli xabar ko'rsatadi.
 */
export function RequirePermission({
  permission,
  children,
}: {
  permission: PermissionCode;
  children: ReactNode;
}) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    return <div className="grid place-items-center py-24 text-sm text-fg-muted">Yuklanmoqda…</div>;
  }

  if (!can(permission)) {
    return (
      <>
        <PageHeader
          title="Ruxsat yo'q"
          breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: "Ruxsat yo'q" }]}
        />

        <div className="flex flex-col items-center justify-center rounded-card border border-line bg-card px-6 py-16 text-center">
          <ShieldX className="size-10 text-fg-muted" strokeWidth={1.5} />
          <p className="mt-4 text-base font-medium text-fg">
            Bu bo&apos;limga ruxsatingiz yo&apos;q
          </p>
          <p className="mt-1 max-w-md text-sm text-fg-muted">
            Kerak bo&apos;lsa administratordan <span className="font-mono">{permission}</span>{' '}
            ruxsatini so&apos;rang.
          </p>
        </div>
      </>
    );
  }

  return children;
}
