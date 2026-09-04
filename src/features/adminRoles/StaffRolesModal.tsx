import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminUserAccount } from '@/shared/types/adminUsers';

import { useGetRolesQuery, useSetStaffRolesMutation } from './adminRolesApi';

/**
 * Xodimga rol berish.
 *
 * `PUT` — butunlay almashtiradi, qo'shmaydi. Shuning uchun oyna ochilganda
 * xodimda hozir qaysi rollar borligini bilish kerak, lekin `/admin/users/`
 * buni bermaydi. Rollar ro'yxatidan ham aniqlab bo'lmaydi — u faqat
 * `user_count` beradi. Shu sababli tanlov BO'SH boshlanadi va oynada bu
 * ochiq aytiladi: saqlash xodimning rollarini ko'rsatilgan to'plamga
 * almashtiradi.
 */
export function StaffRolesModal({
  user,
  onClose,
}: {
  user: AdminUserAccount | null;
  onClose: () => void;
}) {
  const { data: roles, isLoading } = useGetRolesQuery(
    { page_size: 100, ordering: 'name' },
    { skip: user === null },
  );
  const [setStaffRoles, { isLoading: isSaving, error, reset }] = useSetStaffRolesMutation();

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (user) setSelected([]);
  }, [user]);

  function close() {
    reset();
    onClose();
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function submit() {
    if (!user) return;

    try {
      await setStaffRoles({ id: user.id, role_ids: selected }).unwrap();
    } catch {
      return;
    }

    close();
  }

  return (
    <Modal
      open={user !== null}
      onClose={close}
      title="Xodim rollari"
      description={user ? user.full_name || user.phone || user.email : undefined}
      className="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Bekor qilish
          </Button>
          <Button variant="primary" disabled={isSaving} onClick={() => void submit()}>
            {isSaving ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="rounded-control border border-line bg-input px-3.5 py-3 text-sm text-fg-soft">
          Saqlash xodimning rollarini <b className="text-fg">aynan shu tanlovga</b> almashtiradi.
          Hech narsa tanlanmasa, uning barcha rollari olib tashlanadi.
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-14 bg-skeleton rounded-control" />
            ))}
          </div>
        ) : !roles || roles.results.length === 0 ? (
          <p className="rounded-control border border-dashed border-line px-4 py-8 text-center text-sm text-fg-muted">
            Hali rol yaratilmagan.
          </p>
        ) : (
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {roles.results.map((role) => (
              <label
                key={role.id}
                className="flex items-start gap-2.5 rounded-control border border-line px-3.5 py-3"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(role.id)}
                  onChange={() => toggle(role.id)}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg">{role.name}</span>
                    {role.is_system && <Badge tone="info">Tizim</Badge>}
                  </span>
                  {role.description && (
                    <span className="block text-xs text-fg-muted">{role.description}</span>
                  )}
                  <span className="block text-[11px] text-fg-dim">
                    {role.permissions.length} ta ruxsat
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        {error !== undefined && error !== null && (
          <p
            role="alert"
            className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {getApiErrorMessage(error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
