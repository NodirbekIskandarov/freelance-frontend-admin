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
}

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
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
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
                    'px-4 py-3.5 text-[13px] font-medium whitespace-nowrap text-fg-muted',
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
                  <td key={column.key} className="px-4 py-4">
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
                  'border-b border-line transition-colors last:border-b-0',
                  onRowClick && 'cursor-pointer hover:bg-elevated/40',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-4 text-fg-soft',
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
