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
          'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-fg-muted',
          iconPosition === 'left' ? 'left-3.5' : 'right-3.5',
        )}
        strokeWidth={1.75}
      />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          'h-10 w-full rounded-control border border-line bg-card text-sm text-fg placeholder:text-fg-muted focus:border-primary/50',
          iconPosition === 'left' ? 'pr-3.5 pl-10' : 'pr-10 pl-3.5',
        )}
        {...props}
      />
    </div>
  );
}
