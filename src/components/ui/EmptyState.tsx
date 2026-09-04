import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

const tones = {
  neutral: 'bg-neutral-quiet text-fg-muted',
  danger: 'bg-danger-quiet text-danger',
} as const;

/**
 * Bo'sh (yoki xato) holat.
 *
 * Ilgari bu bitta markazlashtirilgan kulrang qator edi — «Bunday
 * freelancer topilmadi» — va u sahifa buzilganday ko'rinardi. Bo'sh
 * ro'yxat uch narsani aytishi kerak: nima yo'q, NEGA yo'q va endi nima
 * qilish mumkin.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
  className,
}: {
  icon: LucideIcon;
  title: string;
  /** Sababi yoki keyingi qadam. Bitta jumla. */
  description?: string;
  action?: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}>
      <span className={cn('grid size-11 place-items-center rounded-full', tones[tone])}>
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </span>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-fg">{title}</p>
        {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
      </div>

      {action}
    </div>
  );
}
