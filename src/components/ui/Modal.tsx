import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Kenglik MAZMUNGA qarab, `className` bilan emas.
 *
 * Ilgari hamma modal 580px edi: bitta tasdiq savoli ham, sakkiz maydonli
 * forma ham. Tasdiq oynasida matn qatorlari juda uzun bo'lib o'qilmasdi,
 * formada esa qisqa maydonlar (kod, viloyat) yonma-yon sig'masdi.
 */
const sizes = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
} as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Sarlavha ostidagi kichik tavsif. */
  description?: string;
  size?: keyof typeof sizes;
  children: ReactNode;
  /** Pastdagi tugmalar qatori. Asosiy tugma OXIRIDA turadi. */
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
  size = 'md',
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
        'm-auto w-full rounded-modal border border-line bg-elevated p-0 text-fg shadow-modal',
        // Fon xiralashadi — ortidagi jadval matni modal chekkasida
        // o'qilib turmasin. `open:` — animatsiya faqat ochilganda.
        'backdrop:bg-black/60 backdrop:backdrop-blur-[6px]',
        'motion-safe:open:animate-[modal-in_140ms_var(--ease-soft)]',
        sizes[size],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line-subtle px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish (Esc)"
          className={cn(
            '-mt-1 -mr-1 grid size-8 shrink-0 place-items-center rounded-control text-fg-muted',
            'transition-colors duration-(--dur) ease-soft outline-none',
            'hover:bg-surface-hover hover:text-fg focus-visible:shadow-(--ring)',
          )}
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>

      {/* Tugmalar qatori YOPISHGAN: uzun formada u aylantirilib
          ko'rinmas joyga tushib ketardi va odam «Saqlash» ni qidirardi. */}
      {footer && (
        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-line-subtle bg-elevated px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  );
}
