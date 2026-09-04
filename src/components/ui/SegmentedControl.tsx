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
      /* Yo'lak CHUQURROQ, faol qism esa undan KO'TARILADI — teskarisi
         emas. Ilgari yo'lak karta rangida, faol qism esa undan yorug'roq
         edi va tanlov «bosilgan» emas, «boshqacha» bo'lib ko'rinardi. */
      className={cn('inline-flex rounded-control bg-elevated p-1', className)}
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
              'rounded-xs px-3 py-1 text-[13px] font-medium whitespace-nowrap',
              'transition-[background-color,color,box-shadow] duration-(--dur) ease-soft',
              'outline-none focus-visible:shadow-(--ring)',
              active ? 'bg-card text-fg shadow-card' : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
