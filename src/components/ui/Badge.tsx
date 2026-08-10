import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Dizaynda badge foni — accent rangning ~12% shaffofligi karta ustida
 * (o'lchangan: `Faol` = #0E2224, `Kutilmoqda` = #242018, `Bloklangan` = #2B1921).
 * Shuning uchun to'q fon emas, `/12` opacity ishlatilgan.
 */
const tones = {
  success: 'border-success/25 bg-success/12 text-success',
  warning: 'border-warning/25 bg-warning/12 text-warning',
  danger: 'border-danger/25 bg-danger/12 text-danger',
  info: 'border-info/25 bg-info/12 text-info',
  purple: 'border-purple/25 bg-purple/12 text-purple',
  orange: 'border-orange/25 bg-orange/12 text-orange',
  neutral: 'border-line bg-elevated text-fg-muted',
  primary: 'border-primary/25 bg-primary/12 text-primary',
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-badge border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Matn holatidan badge rangini bir joyda aniqlaydi. */
const statusTones: Record<string, BadgeTone> = {
  Faol: 'success',
  Tasdiqlangan: 'success',
  Yangi: 'info',
  Kutilmoqda: 'warning',
  Kutilyapti: 'warning',
  Tasdiqlashda: 'info',
  'Vaqtinchalik bloklangan': 'warning',
  Bloklangan: 'danger',
  'Rad etilgan': 'danger',
  Arxivlangan: 'danger',
  Variantli: 'success',
  Variantsiz: 'warning',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={statusTones[status] ?? 'neutral'} className={className}>
      {status}
    </Badge>
  );
}
