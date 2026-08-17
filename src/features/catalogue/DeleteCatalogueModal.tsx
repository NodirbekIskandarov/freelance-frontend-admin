import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';

/**
 * Institut va fan uchun umumiy o'chirish tasdig'i.
 *
 * Ikkalasi ham soft-delete va matn deyarli bir xil — farq faqat nomda,
 * shuning uchun bitta komponent `onConfirm` bilan.
 */
export function DeleteCatalogueModal({
  title,
  itemName,
  description,
  isLoading,
  error,
  onConfirm,
  onClose,
}: {
  title: string;
  /** `null` — modal yopiq. */
  itemName: string | null;
  description: string;
  isLoading: boolean;
  error: unknown;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={itemName !== null}
      onClose={onClose}
      title={title}
      description={itemName ?? undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "O'chirilmoqda…" : "O'chirish"}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-fg-soft">{description}</p>

      {error !== undefined && error !== null && (
        <p
          role="alert"
          className="mt-4 rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {getApiErrorMessage(error)}
        </p>
      )}
    </Modal>
  );
}
