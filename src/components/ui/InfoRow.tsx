import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * "Shaxsiy ma'lumotlar" kartasidagi yorliq–qiymat qatori (5-rasm).
 * `<dl>` ishlatilgan: bu ma'no jihatdan ta'rif ro'yxati, oddiy div emas.
 */
export function InfoList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn('flex flex-col gap-3.5', className)}>{children}</dl>;
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-sm text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-fg">{value}</dd>
    </div>
  );
}
