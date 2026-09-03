import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useGetSubjectCategoriesQuery } from '@/features/catalogue/catalogueApi';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminSubjectRequest } from '@/shared/types/adminRequests';

/**
 * Fan arizasini tasdiqlashdan oldin nomni ikki tilda aniqlash.
 *
 * Arizachi bitta tilda yozadi — o'zi qaysi tilda gapirsa. Katalog esa
 * ikkitasini saqlaydi, shuning uchun tarjimani aynan shu yerda so'raymiz:
 * keyin uni qidirib topib to'ldirish kerak bo'lardi.
 *
 * Ruscha nom IXTIYORIY: moderator bilmasa, majburlash uni taxminiy
 * tarjima yozishga undardi.
 */
export function ApproveSubjectModal({
  request,
  isLoading,
  error,
  onConfirm,
  onClose,
}: {
  /** `null` — oyna yopiq. */
  request: AdminSubjectRequest | null;
  isLoading: boolean;
  error?: unknown;
  onConfirm: (values: { name: string; name_ru: string; category: string | null }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [category, setCategory] = useState('');
  const [touched, setTouched] = useState(false);

  /*
   * Toifalar arizadan MUSTAQIL so'raladi va faqat oyna ochilganda.
   *
   * Bu moderator eng ko'p tuzatadigan maydon: arizachi fanni biladi,
   * tasnifni esa har doim ham emas.
   */
  const { data: categoryPage } = useGetSubjectCategoriesQuery(
    { page_size: 200, is_active: true },
    { skip: request === null },
  );
  const categoryOptions = [
    { value: '', label: 'Toifasiz' },
    ...(categoryPage?.results ?? []).map((item) => ({ value: item.id, label: item.name })),
  ];

  useEffect(() => {
    if (!request) return;

    // Arizadagi nom o'zbekcha maydonga tushadi — moderator uni tuzatishi
    // yoki ruschasini yozib, o'zbekchasini qayta yozishi mumkin.
    setName(request.name);
    setNameRu('');
    // Arizachi tanlagan toifa oldindan qo'yiladi — moderator faqat
    // xato bo'lsa tegadi.
    setCategory(request.category ?? '');
    setTouched(false);
  }, [request]);

  const nameError = touched && !name.trim() ? 'Fan nomini kiriting' : undefined;

  function handleConfirm() {
    setTouched(true);
    if (!name.trim()) return;

    onConfirm({ name: name.trim(), name_ru: nameRu.trim(), category: category || null });
  }

  return (
    <Modal
      open={request !== null}
      onClose={onClose}
      title="Arizani tasdiqlash"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Tasdiqlanmoqda…' : 'Tasdiqlash'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed text-fg-muted">
          Tasdiqlangach fan katalogga qo&apos;shiladi. Nomni ikki tilda kiriting — arizachi faqat
          bittasini yuborgan.
        </p>

        <TextField
          label="Fan nomi (o'zbekcha)"
          required
          value={name}
          error={nameError}
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="Fan nomi (ruscha)"
          placeholder="Базы данных"
          value={nameRu}
          hint="Ixtiyoriy — bilmasangiz bo'sh qoldiring, keyin tahrirlash mumkin."
          onChange={(event) => setNameRu(event.target.value)}
        />

        <div>
          <span className="mb-2 block text-sm font-medium text-fg-soft">Fan toifasi</span>
          <Select
            aria-label="Fan toifasi"
            className="w-full"
            searchable={categoryOptions.length > 8}
            searchPlaceholder="Toifa nomi..."
            options={categoryOptions}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
          <p className="mt-1.5 text-xs text-fg-muted">
            Arizachi tanlagani oldindan qo&apos;yilgan — xato bo&apos;lsa tuzating.
          </p>
        </div>

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
