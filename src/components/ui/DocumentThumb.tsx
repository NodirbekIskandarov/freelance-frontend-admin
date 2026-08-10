import { FileImage } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * Pasport/ID skanining kichik ko'rinishi (3-rasm).
 *
 * Dizaynda haqiqiy rasm turadi, lekin `design/assets/` bo'sh — shuning uchun
 * rasm bo'lmaganda hujjat belgisi ko'rsatiladi. `src` kelgach o'zi almashadi.
 */
export function DocumentThumb({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('h-9 w-12 rounded border border-line object-cover', className)}
      />
    );
  }

  return (
    <span
      aria-label={`${alt} — rasm yuklanmagan`}
      className={cn(
        'grid h-9 w-12 place-items-center rounded border border-line bg-elevated text-fg-dim',
        className,
      )}
    >
      <FileImage className="size-4" strokeWidth={1.75} />
    </span>
  );
}
