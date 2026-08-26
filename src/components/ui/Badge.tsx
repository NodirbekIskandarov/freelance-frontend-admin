import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Badge foni — accent rangning 15% shaffofligi karta ustida, chegarasiz.
 *
 * Shablondagi admin panelda shunday: dumaloq, chegarasiz, ozgina fonli.
 * Chegara qo'shilsa qatorlar ichida u ikkinchi ramka bo'lib ko'rinardi.
 */
const tones = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  purple: 'bg-purple/15 text-purple',
  orange: 'bg-orange/15 text-orange',
  neutral: 'bg-fg/10 text-fg-muted',
  primary: 'bg-primary/15 text-primary',
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
        'inline-flex items-center rounded-badge px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
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
