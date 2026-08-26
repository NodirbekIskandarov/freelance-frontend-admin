import { ChevronsUpDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Ustun kengligi/joylashuvi uchun qo'shimcha class (`w-32`, `whitespace-nowrap`). */
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  /** Skeleton qatorlar soni — yuklanayotganda jadval balandligi sakramasin. */
  skeletonRows?: number;
  emptyMessage?: string;
  sort?: SortState;
  onSortChange?: (key: string) => void;
  onRowClick?: (row: T) => void;
  /**
   * `compact` — ustun ko'p bo'lgan jadvallar uchun (freelancerlar: 11 ustun).
   * Kengroq to'ldirish bilan qator konteynerdan chiqib ketadi.
   */
  density?: 'normal' | 'compact';
}

const densityStyles = {
  normal: { head: 'px-4 py-3.5 text-[13px]', cell: 'px-4 py-4 text-sm' },
  // Sarlavha shrifti kataknikidan kichik: 11 ustunli jadvalda eng keng
  // sarlavhalar ("Pasport/ID rasmi", "Bajarilgan ishlar") jadval kengligini
  // belgilab qo'yadi va oxirgi ustunni ekrandan chiqarib yuboradi.
  compact: { head: 'px-2.5 py-3.5 text-[11px]', cell: 'px-2.5 py-3 text-[13px]' },
} as const;

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/**
 * Dizayndagi jadval bir necha ekranda takrorlanadi (foydalanuvchilar,
 * freelancerlar, arizalar, institutlar...). Ustunlar tavsif orqali beriladi,
 * shuning uchun har sahifada `<table>` qaytadan yozilmaydi.
 *
 * Saralash holati tashqarida turadi: u odatda URL yoki RTK Query so'roviga
 * bog'lanadi, jadvalning ichki state'i emas.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  skeletonRows = 8,
  emptyMessage = "Ma'lumot topilmadi",
  sort,
  onSortChange,
  onRowClick,
  density = 'normal',
}: TableProps<T>) {
  const spacing = densityStyles[density];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/*
          Sarlavha qatori fonli va katta harflarda — shablondagi admin
          jadvalida shunday. Bu ustun nomlarini ma'lumotdan ajratadi,
          faqat chegara bilan ajratishdan ko'ra aniqroq.
        */}
        <thead className="bg-fg/[0.04]">
          <tr className="border-b border-line">
            {columns.map((column) => {
              const isSorted = sort?.key === column.key;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={cn(
                    // Sarlavhalar bir qatorda qoladi — dizaynda ham shunday.
                    'font-semibold tracking-wider whitespace-nowrap text-fg-dim uppercase',
                    spacing.head,
                    alignClass[column.align ?? 'left'],
                    column.headerClassName,
                  )}
                >
                  {column.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key)}
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
                    >
                      {column.header}
                      {isSorted ? (
                        <ChevronUp
                          className={cn(
                            'size-3.5 text-primary transition-transform',
                            sort.direction === 'desc' && 'rotate-180',
                          )}
                          strokeWidth={2}
                        />
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-60" strokeWidth={2} />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {isLoading &&
            Array.from({ length: skeletonRows }, (_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-line">
                {columns.map((column) => (
                  <td key={column.key} className={spacing.cell}>
                    <span className="block h-4 animate-pulse rounded bg-elevated" />
                  </td>
                ))}
              </tr>
            ))}

          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center text-fg-muted">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!isLoading &&
            rows.map((row, index) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  // Hover har qatorda, bosiladiganida ham, bosilmaydiganida
                  // ham: shablonda u ko'zni qatorda ushlab turadi, «bu qator
                  // bosiladi» degani emas.
                  'border-b border-line transition-colors last:border-b-0 hover:bg-fg/[0.02]',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'text-fg-soft',
                      spacing.cell,
                      alignClass[column.align ?? 'left'],
                      column.className,
                    )}
                  >
                    {column.cell(row, index)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
