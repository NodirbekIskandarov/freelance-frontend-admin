import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminComment } from '@/shared/types/comments';

/**
 * Izohni olib tashlash tasdig'i.
 *
 * Matnning o'zi ko'rsatiladi: jadvalda u uch qatorda qirqilgan bo'lishi
 * mumkin va moderator nimani o'chirayotganini to'liq ko'rmasdan tasdiqlab
 * yuborardi.
 */
export function DeleteCommentModal({
  comment,
  isLoading,
  error,
  onConfirm,
  onClose,
}: {
  /** `null` — modal yopiq. */
  comment: AdminComment | null;
  isLoading: boolean;
  error: unknown;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={comment !== null}
      onClose={onClose}
      title="Izohni olib tashlash"
      description={comment?.assignment_title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "O'chirilmoqda…" : 'Olib tashlash'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-fg-muted">
        {comment?.author?.full_name?.trim() || 'Foydalanuvchi'} yozgan izoh saytdan yo&apos;qoladi.
        Yozuvning o&apos;zi bazada qoladi — kim nima yozgani haqidagi bahsni keyin ham hal qilish
        mumkin bo&apos;lsin.
      </p>

      <p className="mt-3 rounded-control border border-line bg-elevated px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line text-fg-soft">
        {comment?.body}
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
