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
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border border-dashed px-6 py-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40',
        )}
      >
        <UploadCloud className="size-8 text-primary" strokeWidth={1.5} />

        <p className="text-sm text-fg-muted">
          {children ?? (
            <>
              Faylni yuklash yoki <span className="text-primary">tanlash</span>
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
