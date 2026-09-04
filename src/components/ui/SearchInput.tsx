import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Lupani o'ngga qo'yish — dizaynda ikkala variant ham uchraydi. */
  iconPosition?: 'left' | 'right';
}

export function SearchInput({
  className,
  iconPosition = 'left',
  placeholder = 'Qidirish...',
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-fg-dim',
          iconPosition === 'left' ? 'left-3' : 'right-3',
        )}
        strokeWidth={1.75}
      />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          'h-[34px] w-full rounded-control border border-line bg-input text-[13px] text-fg placeholder:text-fg-dim',
          'transition-[background-color,border-color,box-shadow] duration-(--dur) ease-soft',
          'outline-none focus-visible:border-primary/60 focus-visible:shadow-(--ring)',
          iconPosition === 'left' ? 'pr-3 pl-9' : 'pr-9 pl-3',
        )}
        {...props}
      />
    </div>
  );
}
