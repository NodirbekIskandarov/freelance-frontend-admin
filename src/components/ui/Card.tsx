import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-card border border-line bg-card', className)}>{children}</div>
  );
}

/**
 * Karta sarlavhasi: chapda matn, o'ngda ixtiyoriy amal (select, tugma, link).
 * Dizaynda deyarli har kartada shu naqsh takrorlanadi.
 */
export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 px-5 pt-5', className)}>
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      {action}
    </div>
  );
}
