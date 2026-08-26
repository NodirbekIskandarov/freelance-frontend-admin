import { Check, ChevronDown, Search, SearchX } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Chaqiruvchilar `event.target.value` dan boshqa hech narsa o'qimaydi,
 * shuning uchun tip ham shundan iborat. Mahalliy `<select>` ning to'liq
 * hodisasini soxtalashtirish o'rniga rostini aytamiz.
 */
export interface SelectChangeEvent {
  target: { value: string };
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (event: SelectChangeEvent) => void;
  size?: 'sm' | 'md';
  /** Matndan chapda turadigan ikonka (sana tanlagich, saralash va h.k.). */
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  /** Uzun ro'yxatlar uchun ro'yxat ustidagi qidiruv maydoni. */
  searchable?: boolean;
  searchPlaceholder?: string;
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
 * Tanlov ro'yxati.
 *
 * Mahalliy `<select>` emas, garchi u klaviatura va mobil bilan ishlashni
 * tekinga berardi: brauzer uning ochilgan ro'yxatini operatsion tizimning
 * o'z oynasi bilan chizadi va uni uslublab BO'LMAYDI — qora panel ustida
 * oq ro'yxat chiqib qolardi. Bu yerda ro'yxat oddiy `<ul>`, ya'ni panel
 * temasiga bo'ysunadi.
 *
 * Klaviatura qo'lda qo'shilgan: Escape yopadi, qidiruvda Enter birinchi
 * moslikni tanlaydi, `role="listbox"` skrinrider uchun saqlanadi.
 */
export function Select({
  options,
  value = '',
  onChange,
  size = 'md',
  icon,
  className,
  disabled,
  id,
  'aria-label': ariaLabel,
  searchable = false,
  searchPlaceholder = 'Qidirish...',
}: SelectProps) {
  const autoId = useId();
  const listId = `${autoId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [anchor, setAnchor] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);
  const label = selected?.label ?? options[0]?.label ?? '';

  const needle = query.trim().toLowerCase();
  const visibleOptions =
    searchable && needle
      ? options.filter((option) => option.label.toLowerCase().includes(needle))
      : options;

  /*
   * Ochish va yopish bitta funksiyada: har ochilishda qidiruv tozalanishi
   * kerak, aks holda oldingi so'rov qolib, ro'yxat sababsiz qisqargandek
   * ko'rinardi.
   */
  function setMenuOpen(next: boolean) {
    setOpen(next);
    setQuery('');
  }

  function pick(next: string) {
    onChange?.({ target: { value: next } });
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    /*
     * Ro'yxat `fixed` bilan chiziladi, ya'ni aylantirilsa tugmadan
     * ajralib qolardi. Qayta hisoblash o'rniga yopamiz.
     */
    function onScroll() {
      setMenuOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    // `capture` — ichki aylantiriladigan konteynerlar ham hisobga olinadi.
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  /*
   * `fixed` — ekran koordinatalarida. `absolute` bo'lsa modal yoki
   * `overflow` li karta ro'yxatni qirqib qo'yardi. Portal ishlatilmaydi:
   * ro'yxat DOM'da shu yerda qolgani uchun modal bilan bir qatlamda
   * bo'ladi.
   */
  useLayoutEffect(() => {
    if (!open) return;

    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;

    setAnchor({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [open, visibleOptions.length]);

  // Ochilgach fokus qidiruvga o'tadi — bu DOM ta'siri, holat emas.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      {icon && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-fg-muted',
            size === 'sm' ? 'left-2.5' : 'left-3.5',
          )}
        >
          {icon}
        </span>
      )}

      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => !disabled && setMenuOpen(!open)}
        className={cn(
          'w-full truncate rounded-control border border-line bg-card text-left font-medium text-fg-soft transition-colors hover:bg-elevated disabled:pointer-events-none disabled:opacity-50',
          icon ? sizesWithIcon[size] : sizes[size],
        )}
      >
        {label}
      </button>

      <ChevronDown
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-fg-muted transition-transform',
          size === 'sm' ? 'right-2.5 size-3.5' : 'right-3 size-4',
          open && 'rotate-180',
        )}
        strokeWidth={1.75}
      />

      {open && anchor ? (
        <div
          className="fixed z-100 w-max max-w-[min(22rem,80vw)] overflow-hidden rounded-control border border-line bg-card shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          style={{ top: anchor.top, left: anchor.left, minWidth: anchor.width }}
        >
          {searchable ? (
            <div className="border-b border-line p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fg-muted" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={ariaLabel ? `${ariaLabel} — qidirish` : 'Qidirish'}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && visibleOptions[0]) {
                      event.preventDefault();
                      pick(visibleOptions[0].value);
                    }
                  }}
                  className="h-8 w-full rounded-control border border-line bg-elevated pr-2 pl-8 text-[13px] text-fg outline-none placeholder:text-fg-dim focus:border-primary/50"
                />
              </div>
            </div>
          ) : null}

          {visibleOptions.length === 0 ? (
            <p className="flex items-center gap-2 px-3 py-4 text-[13px] text-fg-muted">
              <SearchX className="size-4 shrink-0" />
              Hech narsa topilmadi
            </p>
          ) : (
            <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
              {visibleOptions.map((option) => {
                const active = option.value === value;

                return (
                  <li key={option.value || '__empty'} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => pick(option.value)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors',
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-fg-soft hover:bg-elevated hover:text-fg',
                      )}
                    >
                      <Check
                        className={cn('size-3.5 shrink-0 text-primary', !active && 'opacity-0')}
                        strokeWidth={2.5}
                      />
                      <span className="truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
