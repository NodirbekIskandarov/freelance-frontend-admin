import { Library } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/cn';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import type { University } from '@/shared/types/catalogue';

import { useGetUniversitiesQuery } from './catalogueApi';

const PAGE_SIZE = 8;

/**
 * Institut logotipi o'rniga bosh harflar.
 *
 * Rang ID'dan hosil qilinadi: qo'lda yozib qo'yilgan jadval yangi institut
 * qo'shilishi bilan eskirardi, ID esa doimiy — shuning uchun rang har
 * renderda bir xil chiqadi.
 */
const TONES = [
  'bg-emerald-500/15 text-emerald-400',
  'bg-sky-500/15 text-sky-400',
  'bg-violet-500/15 text-violet-400',
  'bg-amber-500/15 text-amber-400',
  'bg-rose-500/15 text-rose-400',
  'bg-cyan-500/15 text-cyan-400',
];

export function UniversityBadge({
  university,
  size = 'sm',
}: {
  university: Pick<University, 'id' | 'short_name' | 'name'>;
  size?: 'sm' | 'lg';
}) {
  const seed = [...university.id].reduce((total, char) => total + char.charCodeAt(0), 0);
  const initials = (university.short_name || university.name).slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        size === 'lg' ? 'size-11 text-sm' : 'size-9 text-xs',
        TONES[seed % TONES.length],
      )}
    >
      {initials}
    </span>
  );
}

/** Institut qatoridagi «156 fan · 12 487 topshiriq» yozuvi. */
export function universitySummary(university: University): string {
  return `${formatSom(university.subject_count)} fan · ${formatSom(university.assignment_count)} topshiriq`;
}

/**
 * Chapdagi institutlar ro'yxati.
 *
 * Fanlar ekranining birinchi filtri shu — foydalanuvchi avval institutni
 * tanlaydi, o'ng tomondagi jadval esa o'shanikini ko'rsatadi.
 */
export function UniversityPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  /** `null` — filtr olib tashlanadi, barcha institutlarning fanlari ko'rinadi. */
  onSelect: (university: University | null) => void;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading } = useGetUniversitiesQuery({
    page,
    page_size: PAGE_SIZE,
    ordering: 'short_name',
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const universities = data?.results ?? [];

  return (
    <Card className="flex w-full shrink-0 flex-col lg:w-[300px]">
      <div className="border-b border-line p-4">
        <p className="text-sm font-semibold text-fg">Institutlar ro&apos;yxati</p>
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="mt-3"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {/*
          «Barcha institutlar» — filtrni olib tashlash. Qidiruv yozilganda
          chizilmaydi: u paytda foydalanuvchi aniq institut qidiryapti va
          bu qator faqat natijalarni surib yuborardi.
        */}
        {!debouncedSearch && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-current={selectedId === null}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
              selectedId === null
                ? 'border-primary/50 bg-primary/10'
                : 'border-transparent hover:border-line hover:bg-elevated/60',
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Library className="size-4" strokeWidth={1.75} />
            </span>
            <span
              className={cn(
                'text-[13px] font-semibold',
                selectedId === null ? 'text-primary' : 'text-fg',
              )}
            >
              Barcha institutlar
            </span>
          </button>
        )}

        {isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-[68px] animate-pulse rounded-lg bg-elevated/60" />
          ))
        ) : universities.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-fg-muted">Institut topilmadi</p>
        ) : (
          universities.map((university) => {
            const active = university.id === selectedId;

            return (
              <button
                key={university.id}
                type="button"
                onClick={() => onSelect(university)}
                aria-current={active}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-transparent hover:border-line hover:bg-elevated/60',
                )}
              >
                <UniversityBadge university={university} />

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-[13px] font-semibold',
                      active ? 'text-primary' : 'text-fg',
                    )}
                  >
                    {university.short_name || university.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-fg-muted">
                    {university.name}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-fg-dim">
                    {universitySummary(university)}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <Pagination page={page} totalPages={data?.total_pages ?? 1} onPageChange={setPage} />
    </Card>
  );
}
