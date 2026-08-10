import { useId } from 'react';

import { cn } from '@/lib/cn';

export interface ChoiceOption {
  value: string;
  label: string;
}

/**
 * Radio guruh (15-rasmdagi "Variantli / Variantsiz").
 * Native `<input type="radio">` ustida — o'q tugmalari bilan yurish tekinga keladi.
 */
export function RadioGroup({
  label,
  description,
  options,
  value,
  onChange,
  required,
  className,
}: {
  label: string;
  description?: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}) {
  const name = useId();

  return (
    <fieldset className={className}>
      <legend className="text-sm font-medium text-fg-soft">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
        )}
      </legend>

      {description && <p className="mt-1 text-xs text-fg-muted">{description}</p>}

      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-control border px-4 py-2.5 text-sm transition-colors',
                isSelected
                  ? 'border-primary/60 bg-primary/8 text-fg'
                  : 'border-line bg-input text-fg-muted hover:text-fg',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  'grid size-4 place-items-center rounded-full border-2',
                  isSelected ? 'border-primary' : 'border-fg-dim',
                )}
              >
                {isSelected && <span className="size-1.5 rounded-full bg-primary" />}
              </span>
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Yonma-yon tugmalar (15-rasmdagi "Nechta variant?" — 10/15/20/25/30).
 * Radio'dan farqi: ko'rinishi tugmali, tanlangani yashil fon bilan.
 */
export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-fg-soft">{label}</p>

      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option === value;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option)}
              className={cn(
                'h-9 min-w-12 rounded-control border px-3 text-sm font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-line bg-input text-fg-muted hover:text-fg',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
