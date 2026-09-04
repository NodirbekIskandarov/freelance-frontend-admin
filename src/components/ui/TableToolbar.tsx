import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Jadval ustidagi boshqaruv qatori.
 *
 * Ilgari har sahifa o'z `<section className="flex flex-wrap gap-3">` ini
 * yozardi va natijada qidiruv maydoni bir joyda chapda, boshqa joyda
 * filtrlardan keyin turardi.
 *
 * Muhimi — FAOL FILTRLAR. Ilgari ular faqat tanlagichlarning o'zida
 * ko'rinardi: uchta tanlagich orasidan qaysi biri o'zgartirilganini
 * ko'rish uchun har biriga qarab chiqish kerak edi va «nega ro'yxat
 * bo'sh?» degan savol shu yerdan tug'ilardi.
 */
export function TableToolbar({
  search,
  filters,
  activeFilters = 0,
  onResetFilters,
  actions,
  className,
}: {
  /** Chapda — qidiruv maydoni. */
  search?: ReactNode;
  /** Qidiruvdan keyin — tanlagichlar. */
  filters?: ReactNode;
  /** Nechta filtr sukut qiymatidan farq qiladi. */
  activeFilters?: number;
  onResetFilters?: () => void;
  /** O'ngda — eksport yoki asosiy amal. */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-wrap items-center gap-2', className)}>
      {search}
      {filters}

      {activeFilters > 0 && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className={cn(
            'inline-flex h-[34px] items-center gap-1.5 rounded-badge border border-primary-line bg-primary-quiet px-3',
            'text-[11px] leading-[16px] font-medium text-primary',
            'transition-colors duration-(--dur) ease-soft outline-none',
            'hover:bg-primary/20 focus-visible:shadow-(--ring)',
          )}
        >
          {activeFilters} ta filtr faol
          <span aria-hidden className="text-primary/50">
            ·
          </span>
          Tozalash
          <X className="size-3" strokeWidth={2.5} aria-hidden />
        </button>
      )}

      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </section>
  );
}
