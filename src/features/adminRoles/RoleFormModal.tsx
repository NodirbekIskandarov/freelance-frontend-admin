import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import type { Role } from '@/shared/types/adminRoles';

import {
  useCreateRoleMutation,
  useGetPermissionCatalogueQuery,
  useUpdateRoleMutation,
} from './adminRolesApi';

/**
 * Rol muharriri.
 *
 * Katakchalar `/admin/roles/permissions/` dan chiziladi, qo'lda yozilgan
 * ro'yxatdan emas — shunda backendda yangi ruxsat paydo bo'lsa u o'zi
 * ko'rinadi va hech narsa tekshirmaydigan ruxsat uchun katakcha
 * paydo bo'lib qolmaydi.
 */
export function RoleFormModal({
  open,
  role,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi rol yaratish. */
  role: Role | null;
  onClose: () => void;
}) {
  const { data: catalogue, isLoading: catalogueLoading } = useGetPermissionCatalogueQuery(
    undefined,
    { skip: !open },
  );
  const [createRole, createState] = useCreateRoleMutation();
  const [updateRole, updateState] = useUpdateRoleMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  /*
   * Forma modal OCHILGANDA to'ldiriladi, `role` o'zgarganda emas:
   * saqlangach ro'yxat yangilanadi va `role` yangi nusxaga almashadi —
   * shunda foydalanuvchi kiritgan matn ustiga eski qiymat yozilardi.
   */
  useEffect(() => {
    if (!open) return;

    setName(role?.name ?? '');
    setDescription(role?.description ?? '');
    setSelected(role?.permissions ?? []);
  }, [open, role]);

  const state = role ? updateState : createState;
  const isSystem = role?.is_system ?? false;

  function toggle(code: string) {
    setSelected((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  }

  function toggleGroup(codes: string[], allSelected: boolean) {
    setSelected((current) =>
      allSelected
        ? current.filter((item) => !codes.includes(item))
        : [...new Set([...current, ...codes])],
    );
  }

  function close() {
    createState.reset();
    updateState.reset();
    onClose();
  }

  async function submit() {
    const body = {
      name: name.trim(),
      description: description.trim(),
      permissions: selected,
    };

    try {
      if (role) {
        await updateRole({ id: role.id, ...body }).unwrap();
      } else {
        await createRole(body).unwrap();
      }
    } catch {
      // Xato quyida ko'rsatiladi; forma to'ldirilgancha qoladi.
      return;
    }

    close();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={role ? 'Rolni tahrirlash' : 'Yangi rol'}
      description={
        isSystem
          ? "Tizim roli — uni o'zgartirib bo'lmaydi, faqat ko'rish uchun."
          : 'Rol nomi va u beradigan ruxsatlar.'
      }
      className="max-w-3xl"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {isSystem ? 'Yopish' : 'Bekor qilish'}
          </Button>
          {!isSystem && (
            <Button
              variant="primary"
              disabled={state.isLoading || !name.trim()}
              onClick={() => void submit()}
            >
              {state.isLoading ? 'Saqlanmoqda…' : 'Saqlash'}
            </Button>
          )}
        </>
      }
    >
      <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto">
        <TextField
          label="Nomi"
          required
          maxLength={100}
          disabled={isSystem}
          placeholder="Masalan: Moderator"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <TextAreaField
          label="Tavsif"
          rows={2}
          maxLength={255}
          disabled={isSystem}
          placeholder="Bu rol nima qila oladi — jamoaga tushunarli bo'lsin."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-fg">
            Ruxsatlar
            <span className="ml-2 text-xs font-normal text-fg-muted">
              {selected.length} ta tanlandi
            </span>
          </p>

          {catalogueLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-control bg-elevated" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {catalogue?.map((group) => {
                const codes = group.permissions.map((item) => item.code);
                const allSelected = codes.every((code) => selected.includes(code));

                return (
                  <fieldset
                    key={group.group}
                    className="rounded-control border border-line px-3.5 py-3"
                  >
                    <legend className="flex items-center gap-2 px-1 text-xs font-semibold tracking-wider text-fg-muted uppercase">
                      {group.group}
                      {!isSystem && (
                        <button
                          type="button"
                          onClick={() => toggleGroup(codes, allSelected)}
                          className="text-[11px] font-medium text-primary normal-case hover:underline"
                        >
                          {allSelected ? 'olib tashlash' : 'hammasi'}
                        </button>
                      )}
                    </legend>

                    <div className="mt-1 grid gap-2 sm:grid-cols-2">
                      {group.permissions.map((item) => (
                        <label
                          key={item.code}
                          className="flex items-start gap-2 text-sm text-fg-soft"
                        >
                          <input
                            type="checkbox"
                            disabled={isSystem}
                            checked={selected.includes(item.code)}
                            onChange={() => toggle(item.code)}
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                          />
                          <span className="min-w-0">
                            {item.label}
                            {/* Ba'zi ruxsat faqat menyuni yashiradi — buni
                                aytib turish kerak, aks holda u nimadir
                                himoyalayotgandek ko'rinadi. */}
                            {!item.enforced && (
                              <span className="ml-1 text-xs text-fg-muted">
                                (faqat menyuni yashiradi)
                              </span>
                            )}
                            <span className="block font-mono text-[11px] text-fg-dim">
                              {item.code}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          )}
        </div>

        {state.error !== undefined && state.error !== null && (
          <p
            role="alert"
            className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
          >
            {getApiErrorMessage(state.error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
