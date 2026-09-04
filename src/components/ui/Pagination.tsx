import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import { Select } from './Select';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /**
   * Qatorlar soni tanlagichi. Ikkalasi ham berilmasa tanlagich umuman
   * chizilmaydi — tor panellarda (masalan institutlar ro'yxati) u faqat
   * joy egallaydi va u yerda sahifa hajmi qat'iy.
   */
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  /** Chapda turadigan matn: "Jami 12 482 ta foydalanuvchi". */
  summary?: string;
}

/**
 * Ko'rsatiladigan sahifa raqamlari: boshi, joriy sahifa atrofi va oxiri.
 * Orasidagi uzilishlar `'…'` bilan belgilanadi.
 *
 * 625 sahifa bo'lganda hammasini chizib bo'lmaydi — dizaynda ham
 * `1 2 3 … 625` ko'rinishi bor.
 */
function pageItems(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: (number | '…')[] = [];
  const around = [page - 1, page, page + 1].filter((n) => n > 1 && n < totalPages);
  const middle = around.length > 0 ? around : [2, 3];

  items.push(1);
  if ((middle[0] ?? 2) > 2) items.push('…');
  items.push(...middle);
  if ((middle[middle.length - 1] ?? 0) < totalPages - 1) items.push('…');
  items.push(totalPages);

  return items;
}

const buttonBase = cn(
  'grid h-8 min-w-8 place-items-center rounded-control px-2 text-[13px] font-medium',
  'transition-[background-color,border-color,color,box-shadow] duration-(--dur) ease-soft',
  'outline-none focus-visible:shadow-(--ring) disabled:pointer-events-none disabled:opacity-40',
);

export function Pagination({
  page,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  perPageOptions = [10, 20, 50, 100],
  summary,
}: PaginationProps) {
  const items = pageItems(page, totalPages);

  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-4 border-t border-line-subtle px-5 py-2">
      {summary ? <p className="text-[13px] text-fg-muted">{summary}</p> : <span />}

      <div className="flex items-center gap-4">
        <nav aria-label="Sahifalar" className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Oldingi sahifa"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(buttonBase, 'border border-line text-fg-muted hover:bg-surface-hover hover:text-fg')}
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </button>

          {items.map((item, index) =>
            item === '…' ? (
              <span
                key={`gap-${index}`}
                className="grid h-8 min-w-8 place-items-center text-[13px] text-fg-dim"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  buttonBase,
                  item === page
                    ? // Joriy sahifa — TUS, to'ldirilgan blok emas: u
                      // shunchaki «siz shu yerdasiz» deydi va bu jadval
                      // ustidagi asosiy tugmadan baland ovozda
                      // aytilmasligi kerak.
                      'border border-primary-line bg-primary-quiet text-primary'
                    : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Keyingi sahifa"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(buttonBase, 'border border-line text-fg-muted hover:bg-surface-hover hover:text-fg')}
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </button>
        </nav>

        {perPage !== undefined && onPerPageChange ? (
          <Select
            aria-label="Sahifadagi qatorlar soni"
            size="sm"
            value={String(perPage)}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            options={perPageOptions.map((option) => ({
              value: String(option),
              label: `${option} / sahifa`,
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}
