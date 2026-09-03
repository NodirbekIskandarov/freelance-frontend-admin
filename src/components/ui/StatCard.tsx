import { ArrowDown, ArrowUp, Minus, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

/** Karta yuqori qirrasidagi yorug' chiziq — `Card` bilan bir xil. */
const cardSheen = 'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]';

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
  /**
   * O'q ikonkasisiz rangli matn (2-rasmdagi "90.2%" va "2.6%").
   * `trend` bilan birga ishlatilmaydi.
   */
  caption?: { text: string; tone: 'success' | 'danger' | 'muted' };
  className?: string;
}

const captionTones = {
  success: 'text-success',
  danger: 'text-danger',
  muted: 'text-fg-muted',
} as const;

const trendStyles = {
  up: { icon: ArrowUp, color: 'text-success' },
  down: { icon: ArrowDown, color: 'text-danger' },
  flat: { icon: Minus, color: 'text-fg-muted' },
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  trend,
  caption,
  className,
}: StatCardProps) {
  const trendStyle = trend ? trendStyles[trend.direction] : null;
  const TrendIcon = trendStyle?.icon;

  return (
    <div
      className={cn(
        'flex flex-col rounded-card border border-line bg-card p-4',
        cardSheen,
        className,
      )}
    >
      {/*
        Ikonka TEPADA, chapda emas.

        Dashboarddagi ko'rsatkich kartalari bilan bir maromda: yorliq —
        nom — qiymat — izoh. Ilgari ikonka 48px bo'lib chap tomonda
        turardi va karta balandligini matnidan ko'ra o'zi belgilardi;
        yonma-yon turgan to'rtta karta esa dashboarddagi o'ntasidan
        boshqacha ko'rinardi.
      */}
      <span className={cn('grid size-8 w-fit place-items-center rounded-lg', iconTones[tone])}>
        <Icon className="size-4" strokeWidth={1.75} />
      </span>

      <p
        className="mt-2.5 truncate text-xs text-fg-muted"
        title={typeof label === 'string' ? label : undefined}
      >
        {label}
      </p>

      <p className="mt-1.5 text-[22px] leading-none font-semibold tracking-tight text-fg tabular-nums">
        {value}
      </p>

      {trend && TrendIcon && (
        <p className="mt-3 flex items-center gap-1 text-[11px]">
          <TrendIcon className={cn('size-3 shrink-0', trendStyle.color)} strokeWidth={2.5} />
          <span className={cn('font-medium tabular-nums', trendStyle.color)}>{trend.value}</span>
          {trend.note && <span className="text-fg-muted">{trend.note}</span>}
        </p>
      )}

      {caption && (
        <p className={cn('mt-3 text-[11px] font-medium', captionTones[caption.tone])}>
          {caption.text}
        </p>
      )}
    </div>
  );
}
