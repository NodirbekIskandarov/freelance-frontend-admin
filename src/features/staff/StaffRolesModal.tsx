import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useGetRolesQuery, useSetStaffRolesMutation } from '@/features/adminRoles/adminRolesApi';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminUserAccount } from '@/shared/types/adminUsers';

/**
 * Foydalanuvchiga rol biriktirish.
 *
 * Rollar BUTUNLAY almashtiriladi, qo'shilmaydi: oyna katakchalarning
 * to'liq to'plamini ko'rsatadi va ko'rsatganini saqlaydi — qisman
 * yangilash foydalanuvchi ko'rgan holat bilan jimgina ziddiyatga
 * tushardi.
 *
 * Panelga kirish shu tanlovdan kelib chiqadi: kamida bitta rol berilsa
 * odam panelga kira oladi, hammasi olib tashlansa — kira olmaydi.
 * Alohida «admin qilish» bayrog'i yo'q, chunki u bir qarorni ikkiga
 * bo'lardi va biri ikkinchisisiz ma'nosiz.
 */
export function StaffRolesModal({
  user,
  onClose,
}: {
  /** `null` — modal yopiq. */
  user: AdminUserAccount | null;
  onClose: () => void;
}) {
  const { data: roles, isLoading: rolesLoading } = useGetRolesQuery(
    { page_size: 100 },
    { skip: !user },
  );
  const [setStaffRoles, { isLoading, error, reset }] = useSetStaffRolesMutation();

  /*
   * Tanlov foydalanuvchi almashganda qayta boshlanadi. Modal chaqiruvchida
   * SHARTLI chizilmaydi (u har doim DOM'da), shuning uchun holat o'zi
   * tozalanmaydi — render paytida moslanadi.
   */
  const [lastUserId, setLastUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  if (user && lastUserId !== user.id) {
    setLastUserId(user.id);
    // Nomlar bo'yicha moslanadi: foydalanuvchi yozuvida rol NOMLARI bor,
    // katakchalar esa identifikator bilan ishlaydi.
    setSelected(
      (roles?.results ?? [])
        .filter((role) => user.roles.includes(role.name))
        .map((role) => role.id),
    );
    reset();
  }

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function handleSubmit() {
    if (!user) return;

    try {
      await setStaffRoles({ id: user.id, role_ids: selected }).unwrap();
    } catch {
      return;
    }

    onClose();
  }

  const name = user?.full_name?.trim() || user?.phone || user?.email || 'Foydalanuvchi';

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title="Rollarni biriktirish"
      description={name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isLoading || rolesLoading}>
            {isLoading ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </>
      }
    >
      {rolesLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-12 bg-skeleton rounded-control" />
          ))}
        </div>
      ) : (roles?.results ?? []).length === 0 ? (
        <p className="py-6 text-center text-sm text-fg-muted">
          Hali rol yaratilmagan. Avval «Rollar va ruxsatlar» bo&apos;limida rol yarating.
        </p>
      ) : (
        <div className="space-y-2">
          {(roles?.results ?? []).map((role) => {
            const checked = selected.includes(role.id);

            return (
              <label
                key={role.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-control border px-3.5 py-2.5 transition-colors',
                  checked ? 'border-primary/50 bg-primary/8' : 'border-line hover:bg-surface-hover',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(role.id)}
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">{role.name}</span>
                  <span className="block text-xs text-fg-muted">
                    {role.description || `${role.permissions.length} ta ruxsat`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      {/* Natijani oldindan aytish: bu tanlov faqat rol emas, panelga
          kirish huquqini ham hal qiladi. */}
      <p className="mt-4 rounded-control border border-line bg-elevated px-3.5 py-2.5 text-xs leading-relaxed text-fg-soft">
        {selected.length === 0
          ? `${name} admin panelga kira olmaydi.`
          : `${name} admin panelga kira oladi va tanlangan ${selected.length} ta rol bergan bo'limlarni ko'radi.`}
      </p>

      {error !== undefined && error !== null && (
        <p
          role="alert"
          className="mt-3 rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {getApiErrorMessage(error)}
        </p>
      )}
    </Modal>
  );
}
