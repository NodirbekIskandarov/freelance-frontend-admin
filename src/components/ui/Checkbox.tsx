import { Check } from 'lucide-react';
import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Belgilash katakchasi.
 *
 * Native `<input type="checkbox">` + `accent-primary` brauzerdan
 * brauzerga boshqacha chiziladi va qorong'i panelda ba'zilarida oq
 * kvadrat bo'lib qolardi. Bu yerda kirish elementi ko'rinmas, shakl esa
 * bizniki — lekin klaviatura, `label` bog'lanishi va skrinrider
 * native'dan qoladi.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="relative grid size-4 shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className={cn(
            'grid size-4 place-items-center rounded-xs border',
            'transition-[background-color,border-color,box-shadow] duration-(--dur) ease-soft',
            'peer-focus-visible:shadow-(--ring)',
            checked ? 'border-primary bg-primary text-on-accent' : 'border-line-strong bg-input',
            disabled && 'opacity-50',
          )}
        >
          {checked && <Check className="size-3" strokeWidth={3} />}
        </span>
      </span>

      <label htmlFor={id} className={cn('cursor-pointer', disabled && 'cursor-not-allowed')}>
        <span className="block text-[13px] text-fg-soft">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-fg-dim">{hint}</span>}
      </label>
    </div>
  );
}
