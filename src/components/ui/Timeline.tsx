import { cn } from '@/lib/cn';
import type { TimelineEntry } from '@/shared/types/applicationDetail';

const dotTones = {
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  muted: 'bg-fg-dim',
} as const;

/**
 * Gorizontal "Faollik tarixi" (5-rasm): rangli nuqta + izoh + sana.
 * Sanasi yo'q qadam hali sodir bo'lmagan — u xira ko'rsatiladi.
 */
export function Timeline({ entries, className }: { entries: TimelineEntry[]; className?: string }) {
  return (
    <ol className={cn('flex flex-wrap gap-x-12 gap-y-5', className)}>
      {entries.map((entry) => (
        <li key={entry.label} className="flex items-start gap-2.5">
          <span
            aria-hidden
            className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', dotTones[entry.tone])}
          />
          <span>
            <span className={cn('block text-sm', entry.date ? 'text-fg' : 'text-fg-muted')}>
              {entry.label}
            </span>
            {entry.date && <span className="mt-0.5 block text-xs text-fg-muted">{entry.date}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
