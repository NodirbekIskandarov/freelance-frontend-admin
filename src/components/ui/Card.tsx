import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Yuqori qirradagi ingichka yorug' chiziq — shablondagi admin kartasida
 * shunday. U kartani fondan ajratib, «ko'tarilgan» ko'rinish beradi;
 * faqat chegara bilan karta tekis qog'ozdek turardi.
 */
const cardSheen = 'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-card border border-line bg-card', cardSheen, className)}>
      {children}
    </div>
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
