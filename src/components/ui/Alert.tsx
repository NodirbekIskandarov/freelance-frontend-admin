import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

const tones = {
  info: { box: 'border-primary/25 bg-primary/8', icon: 'text-primary', Icon: Info },
  warning: { box: 'border-warning/25 bg-warning/8', icon: 'text-warning', Icon: TriangleAlert },
  danger: { box: 'border-danger/25 bg-danger/8', icon: 'text-danger', Icon: CircleAlert },
} as const;

/** 12-rasmdagi modal ostidagi "Ma'lumot" bloki. */
export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { box, icon, Icon } = tones[tone];

  return (
    <div className={cn('flex gap-3 rounded-card border p-4', box, className)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', icon)} strokeWidth={1.75} />
      <div className="min-w-0">
        {title && <p className="text-sm font-semibold text-fg">{title}</p>}
        <p className="mt-1 text-sm leading-relaxed text-fg-muted">{children}</p>
      </div>
    </div>
  );
}
