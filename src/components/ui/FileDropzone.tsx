import { UploadCloud } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface FileDropzoneProps {
  label?: string;
  /** Yorliq ostidagi izoh: "PNG, JPG yoki SVG formatda. Maksimal hajm: 2MB". */
  description?: string;
  accept?: string;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  /** Zona ichidagi matn. Berilmasa standart matn ishlatiladi. */
  children?: ReactNode;
  /** Zona ostidagi qo'shimcha satr (15-rasmdagi ruxsat etilgan formatlar). */
  hint?: string;
  /**
   * Zona ichidagi tugma ko'rinishidagi yorliq (15-rasm).
   * `<button>` emas, `<span>`: butun zona allaqachon bosiladigan, ichiga
   * yana bosiladigan element qo'yilsa fokus tartibi chalkashadi.
   */
  actionLabel?: string;
  className?: string;
}

/**
 * Faylni sudrab tashlash yoki tanlash zonasi (9 va 15-rasmlar).
 *
 * Ichida yashiringan `<input type="file">` turadi — shu sababli klaviatura
 * va skrinrider bilan ishlaydi; ko'rinadigan qism esa uning yorlig'i.
 */
export function FileDropzone({
  label,
  description,
  accept,
  multiple,
  onFiles,
  children,
  hint,
  actionLabel,
  className,
}: FileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const emit = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles?.(Array.from(list));
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-fg-soft">
          {label}
        </label>
      )}
      {description && <p className="mt-1 mb-3 text-xs text-fg-muted">{description}</p>}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          emit(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        /*
          Chegara UZUQ va QALIN. Ilgari u maydonlar bilan bir xil radius
          va bir xil kuchdagi chiziqqa ega edi — zona «katta input» bo'lib
          ko'rinardi va unga fayl tashlash mumkinligi bilinmasdi.
        */
        className={cn(
          'flex min-h-30 cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed px-6 py-6 text-center',
          'transition-colors duration-(--dur) ease-soft',
          isDragging
            ? 'border-primary bg-primary-quiet'
            : 'border-line-strong hover:border-primary/50 hover:bg-surface-hover',
        )}
      >
        <span className="grid size-10 place-items-center rounded-full border border-primary-line bg-primary-quiet text-primary">
          <UploadCloud className="size-5" strokeWidth={1.75} />
        </span>

        <p className="text-[13px] text-fg-muted">
          {children ?? (
            <>
              Faylni yuklang yoki{' '}
              <span className="font-medium text-primary underline underline-offset-2">
                {actionLabel ?? 'tanlang'}
              </span>
            </>
          )}
        </p>

        {hint && <p className="text-xs text-fg-dim">{hint}</p>}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => emit(event.target.files)}
        />
      </div>
    </div>
  );
}
