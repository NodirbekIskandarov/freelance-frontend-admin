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
  /**
   * O'ng chetga YOPISHADI — jadval gorizontal siljiganda ham ko'rinib
   * turadi. Amallar ustuni uchun: u siljib chiqib ketsa qatorni
   * boshqarish uchun har safar o'ngga surish kerak bo'lardi.
   */
  sticky?: boolean;
  /**
   * Telefondagi karta ko'rinishida SARLAVHA bo'ladi. Ko'rsatilmasa
   * birinchi ustun olinadi.
   */
  primary?: boolean;
  /** Telefonda umuman chizilmaydi — kartada joy hamma ustunga yetmaydi. */
  hideOnMobile?: boolean;
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

/*
 * Yopishgan ustun O'Z FONIGA ega bo'lishi shart: shaffof qolsa ostidan
 * siljiyotgan matn ko'rinib turadi. Chapdagi soya esa u "suzib" turgani
 * va ortida yana ustun borligini bildiradi.
 */
/*
 * `before:pointer-events-none` — SHART.
 *
 * Soya psevdo-elementi katak ustida turadi va usiz u bosishlarni o'ziga
 * olardi: aynan shu katakda `⋯` menyusi ochiladi, ya'ni menyu bandini
 * bosib bo'lmasdi. Xato ko'rinmaydi — tugma bosilgandek turadi, faqat
 * hech nima bo'lmaydi.
 */
const stickyCell =
  'sticky right-0 z-10 bg-card before:pointer-events-none before:absolute before:inset-y-0 before:-left-3 before:w-3 before:bg-gradient-to-l before:from-card before:to-transparent before:content-[""]';
const stickyHead = 'sticky right-0 z-10 bg-elevated';

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

  const primaryColumn = columns.find((column) => column.primary) ?? columns[0];
  const cardColumns = columns.filter((column) => column !== primaryColumn && !column.hideOnMobile);

  return (
    <>
      {/*
        Telefonda jadval KARTAGA aylanadi.

        Ilgari u gorizontal siljirdi va 390px ekranda yetti ustunli
        jadvalni o'qish uchun har qatorni chapga-o'ngga surish kerak
        edi — amallar ustuni esa doim ko'rinmas chetda qolardi.

        Ustunlar tavsifi o'sha-o'sha ishlatiladi: har sahifa uchun
        alohida mobil qolip yozilmaydi.
      */}
      <div className="flex flex-col gap-2.5 p-3 sm:hidden">
        {isLoading &&
          Array.from({ length: Math.min(skeletonRows, 5) }, (_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-card bg-elevated" />
          ))}

        {!isLoading && rows.length === 0 && (
          <p className="py-12 text-center text-sm text-fg-muted">{emptyMessage}</p>
        )}

        {!isLoading &&
          rows.map((row, index) => (
            <div
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'rounded-card border border-line p-3.5',
                onRowClick && 'cursor-pointer transition-colors active:bg-elevated',
              )}
            >
              <div className="text-sm font-medium text-fg">{primaryColumn?.cell(row, index)}</div>

              <dl className="mt-2.5 flex flex-col gap-1.5">
                {cardColumns.map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-3">
                    <dt className="shrink-0 text-[11px] tracking-wide text-fg-dim uppercase">
                      {column.header}
                    </dt>
                    <dd className="min-w-0 text-right text-[13px] text-fg-soft">
                      {column.cell(row, index)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
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
                      column.sticky && stickyHead,
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
                        column.sticky && stickyCell,
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
    </>
  );
}
