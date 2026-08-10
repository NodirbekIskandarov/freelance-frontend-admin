import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * Ikonka chipining rangi. Dizaynda har karta o'z rangida:
 * yashil, ko'k, binafsha, to'q sariq, cyan, sariq.
 */
const iconTones = {
  success: 'bg-success/12 text-success',
  info: 'bg-info/12 text-info',
  purple: 'bg-purple/12 text-purple',
  orange: 'bg-orange/12 text-orange',
  cyan: 'bg-cyan/12 text-cyan',
  warning: 'bg-warning/12 text-warning',
  danger: 'bg-danger/12 text-danger',
} as const;

export type StatTone = keyof typeof iconTones;

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: StatTone;
  /** O'sish qatori: `up` yashil, `down` qizil, `flat` kulrang. */
  trend?: {
    direction: 'up' | 'down' | 'flat';
    value: string;
    /** Qiymatdan keyingi izoh: "bugun", "bu oy". */
    note?: string;
  };
  className?: string;
}

const trendStyles = {
  up: { icon: ArrowUp, color: 'text-success' },
  down: { icon: ArrowDown, color: 'text-danger' },
  flat: { icon: Minus, color: 'text-fg-muted' },
} as const;

export function StatCard({ label, value, icon: Icon, tone, trend, className }: StatCardProps) {
  const trendStyle = trend ? trendStyles[trend.direction] : null;
  const TrendIcon = trendStyle?.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-card border border-line bg-card p-5',
        className,
      )}
    >
      <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl', iconTones[tone])}>
        <Icon className="size-6" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-fg-muted">{label}</p>
        <p className="mt-1 text-[26px] leading-tight font-semibold tracking-tight text-fg">
          {value}
        </p>

        {trend && TrendIcon && (
          <p className="mt-1.5 flex items-center gap-1 text-[13px]">
            <TrendIcon className={cn('size-3.5 shrink-0', trendStyle.color)} strokeWidth={2.5} />
            <span className={cn('font-medium', trendStyle.color)}>{trend.value}</span>
            {trend.note && <span className="text-fg-muted">{trend.note}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
