import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Sarlavha ostidagi kichik tavsif (15-rasmdagi modalda bor). */
  description?: string;
  children: ReactNode;
  /** Pastdagi tugmalar qatori. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Native `<dialog>` ustiga qurilgan.
 *
 * Sabab: fokus tuzog'i, Esc bilan yopilish va sahifa ortidagi kontentni
 * inert qilish brauzerdan tekinga keladi. Qo'lda yozilgan modalda bularning
 * har biri alohida xato manbai bo'ladi.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      // Esc bosilganda brauzer `cancel` yuboradi — holatni tashqarida
      // yangilash uchun ushlab olamiz.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      // Fon bosilganda yopiladi: bosish aynan `<dialog>` ustiga tushsa,
      // demak u ::backdrop hududiga tegdi.
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        'm-auto w-full max-w-[580px] rounded-modal border border-line bg-card p-0 text-fg shadow-modal backdrop:bg-black/70',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-fg">{title}</h2>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-control text-fg-muted transition-colors hover:bg-elevated hover:text-fg"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 px-6 pb-6">{footer}</div>
      )}
    </dialog>
  );
}
