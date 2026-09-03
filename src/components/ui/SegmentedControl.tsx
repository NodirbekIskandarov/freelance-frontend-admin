import { cn } from '@/lib/cn';

/**
 * Bir nechta variantdan bittasi — yonma-yon tugmalar.
 *
 * `Select` emas: variantlar to'rttadan kam va ular ekranning eng ko'p
 * ishlatiladigan boshqaruvi. Ochiladigan ro'yxatda har almashtirish ikki
 * bosish, bu yerda esa bitta — va joriy tanlov ro'yxatni ochmasdan
 * ko'rinib turadi.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  'aria-label': string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('inline-flex rounded-control border border-line bg-card p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              'rounded-[6px] px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              active ? 'bg-elevated text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
