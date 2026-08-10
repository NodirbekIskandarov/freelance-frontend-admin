import { ChevronDown } from 'lucide-react';
import type { ReactNode, SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  size?: 'sm' | 'md';
  /** Matndan chapda turadigan ikonka (sana tanlagich, qidiruv va h.k.). */
  icon?: ReactNode;
}

const sizes = {
  sm: 'h-8 pl-3 pr-8 text-[13px]',
  md: 'h-10 pl-3.5 pr-9 text-sm',
} as const;

/** Ikonka bo'lganda matn uning ustiga tushmasligi uchun qo'shimcha chap joy. */
const sizesWithIcon = {
  sm: 'h-8 pl-8 pr-8 text-[13px]',
  md: 'h-10 pl-10 pr-9 text-sm',
} as const;

/**
 * Native `<select>` ustiga qurilgan.
 *
 * Maxsus dropdown emas — klaviatura, mobil va skrinrider bilan ishlashi
 * bepul keladi. Dizaynda ko'rinish oddiy: fon + chegara + chevron,
 * shuning uchun native yetarli.
 */
export function Select({ options, size = 'md', icon, className, ...props }: SelectProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      {icon && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-fg-muted',
            size === 'sm' ? 'left-2.5' : 'left-3.5',
          )}
        >
          {icon}
        </span>
      )}

      <select
        className={cn(
          'w-full appearance-none rounded-control border border-line bg-card font-medium text-fg-soft transition-colors hover:bg-elevated',
          icon ? sizesWithIcon[size] : sizes[size],
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-card">
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-fg-muted',
          size === 'sm' ? 'right-2.5 size-3.5' : 'right-3 size-4',
        )}
        strokeWidth={1.75}
      />
    </div>
  );
}
