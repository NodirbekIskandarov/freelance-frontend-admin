import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import type { SubjectCategory } from '@/shared/types/catalogue';

import { useCreateSubjectCategoryMutation, useUpdateSubjectCategoryMutation } from './catalogueApi';

/**
 * Toifa yaratish / tahrirlash.
 *
 * `slug` maydoni YO'Q: uni backend nomdan bir marta yasaydi va keyin
 * o'zgartirmaydi. Uni qo'lda tahrirlash mumkin bo'lsa, nomni tuzatgan
 * odam manzillarni ham buzib qo'yishi mumkin edi.
 */
export function SubjectCategoryFormModal({
  open,
  category,
  onClose,
}: {
  open: boolean;
  /** `null` — yangi toifa. */
  category: SubjectCategory | null;
  onClose: () => void;
}) {
  const [createCategory, createState] = useCreateSubjectCategoryMutation();
  const [updateCategory, updateState] = useUpdateSubjectCategoryMutation();

  const [name, setName] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [position, setPosition] = useState('100');
  const [isActive, setIsActive] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    /*
     * `name_uz` — ustunning O'ZI, `name` esa joriy tilga qarab yechilgan
     * qiymat. Tahrirlashda ustun kerak: aks holda ruscha interfeysda
     * o'zbekcha nom ruscha nom bilan almashib ketardi.
     */
    setName(category?.name_uz ?? category?.name ?? '');
    setNameRu(category?.name_ru ?? '');
    setPosition(String(category?.position ?? 100));
    setIsActive(category?.is_active ?? true);
    setTouched(false);
    createState.reset();
    updateState.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const nameError = touched && !name.trim() ? 'Toifa nomini kiriting' : undefined;
  const isSaving = createState.isLoading || updateState.isLoading;
  const error = createState.error ?? updateState.error;

  async function handleSubmit() {
    setTouched(true);
    if (!name.trim()) return;

    const body = {
      name: name.trim(),
      name_ru: nameRu.trim(),
      position: Number(position) || 100,
      is_active: isActive,
    };

    try {
      if (category) {
        await updateCategory({ id: category.id, body }).unwrap();
      } else {
        await createCategory(body).unwrap();
      }
    } catch {
      return;
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Toifani tahrirlash' : 'Yangi toifa'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button disabled={isSaving} onClick={() => void handleSubmit()}>
            {isSaving ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Nomi (o'zbekcha)"
          required
          value={name}
          error={nameError}
          placeholder="Aniq fanlar"
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="Nomi (ruscha)"
          value={nameRu}
          placeholder="Точные науки"
          /* Majburiy emas, lekin bo'sh qolsa rus tilidagi katalogda toifa
             o'zbekcha nom bilan chiqadi — buni oldindan aytamiz. */
          hint="Bo'sh qolsa rus tilidagi katalogda o'zbekcha nomi ko'rinadi."
          onChange={(event) => setNameRu(event.target.value)}
        />

        <TextField
          label="Tartib raqami"
          inputMode="numeric"
          value={position}
          hint="Kichik raqam yuqorida turadi. Teng bo'lsa alifbo bo'yicha saralanadi."
          onChange={(event) => setPosition(event.target.value.replace(/\D/g, ''))}
        />

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span className="text-sm text-fg-soft">
            Faol — katalog filtrida ko&apos;rinadi
            <span className="mt-0.5 block text-xs text-fg-muted">
              Nofaol toifa filtrdan yo&apos;qoladi, lekin fanlarda saqlanib qoladi.
            </span>
          </span>
        </label>

        {error !== undefined && error !== null && (
          <p role="alert" className="text-sm text-danger">
            {getApiErrorMessage(error)}
          </p>
        )}
      </div>
    </Modal>
  );
}
