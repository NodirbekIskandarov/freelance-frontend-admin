import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getApiErrorMessage } from '@/shared/api';

/**
 * Halokatli amal uchun tasdiq oynasi.
 *
 * Ilgari bloklash va muzlatish jadval qatoridagi ikonkani bir marta
 * bosish bilan bajarilardi — zararsiz amallar (ko'rish, tahrirlash)
 * yonida, bir xil o'lchamda. Sichqoncha bir piksel sirg'alsa odam
 * hisobni bloklab qo'yardi va buni orqaga qaytarish yo'li yo'q edi.
 *
 * Matn KIMGA nima bo'lishini aytadi, «Ishonchingiz komilmi?» emas:
 * ikkinchisi hech qanday ma'lumot bermaydi va odam baribir tasdiqni
 * bosadi.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isLoading = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  /** Nima bo'lishi va kimga — aniq gap bilan. */
  description: string;
  confirmLabel: string;
  pendingLabel?: string;
  isLoading?: boolean;
  error?: unknown;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (pendingLabel ?? 'Bajarilmoqda…') : confirmLabel}
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
