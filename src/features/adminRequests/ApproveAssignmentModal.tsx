import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminAssignmentRequest } from '@/shared/types/adminRequests';

/**
 * Topshiriq arizasini tasdiqlashdan oldin nomni ikki tilda aniqlash.
 *
 * Fan arizasidagi oyna bilan bir xil mantiq: arizachi bitta tilda yozadi,
 * katalog ikkitasini saqlaydi. Tarjima ixtiyoriy — moderator bilmasa,
 * majburlash uni taxminiy tarjima yozishga undardi.
 */
export function ApproveAssignmentModal({
  request,
  isLoading,
  error,
  onConfirm,
  onClose,
}: {
  /** `null` — oyna yopiq. */
  request: AdminAssignmentRequest | null;
  isLoading: boolean;
  error?: unknown;
  onConfirm: (titles: { title: string; title_ru: string }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!request) return;

    setTitle(request.title);
    setTitleRu('');
    setTouched(false);
  }, [request]);

  const titleError = touched && !title.trim() ? 'Topshiriq nomini kiriting' : undefined;

  function handleConfirm() {
    setTouched(true);
    if (!title.trim()) return;

    onConfirm({ title: title.trim(), title_ru: titleRu.trim() });
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
          Tasdiqlangach topshiriq katalogga qo&apos;shiladi
          {request?.variant_count ? ` va ${request.variant_count} ta variant yaratiladi` : ''}.
          Nomni ikki tilda kiriting — arizachi faqat bittasini yuborgan.
        </p>

        <TextField
          label="Topshiriq nomi (o'zbekcha)"
          required
          maxLength={255}
          value={title}
          error={titleError}
          onChange={(event) => setTitle(event.target.value)}
        />

        <TextField
          label="Topshiriq nomi (ruscha)"
          maxLength={255}
          placeholder="Например: Самостоятельная работа 12"
          value={titleRu}
          hint="Ixtiyoriy — bilmasangiz bo'sh qoldiring, keyin tahrirlash mumkin."
          onChange={(event) => setTitleRu(event.target.value)}
        />

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
