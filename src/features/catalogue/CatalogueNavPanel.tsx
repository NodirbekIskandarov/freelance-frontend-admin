import { ArrowLeft, Library } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/cn';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { UNIVERSITY_PANEL_ORDERING, type Subject, type University } from '@/shared/types/catalogue';

import { useGetSubjectsQuery, useGetUniversitiesQuery } from './catalogueApi';
import { UniversityBadge, universitySummary } from './UniversityPanel';

const PAGE_SIZE = 8;

/**
 * Ikki qavatli katalog navigatsiyasi: institutlar → o'sha institutning fanlari.
 *
 * Uchinchi ustun QILINMADI, garchi ierarxiya uchta darajali bo'lsa ham.
 * Sabab — gorizontal joy: admin yon menyusi 244px, panel 300px, topshiriqlar
 * jadvalining eng kam kengligi esa ~1070px. Ikkita panel yonma-yon turganda
 * 1440px ekranda jadvalga ~550px qoladi va doimiy gorizontal aylantirish
 * paydo bo'lardi. Bir qavatdan ikkinchisiga o'tish esa bitta ustun joy
 * egallaydi va jadvalni to'liq kenglikda qoldiradi.
 */
export function CatalogueNavPanel({
  university,
  subjectId,
  onSelectUniversity,
  onSelectSubject,
}: {
  university: University | null;
  subjectId: string | null;
  /** `null` — filtr olib tashlanadi. */
  onSelectUniversity: (university: University | null) => void;
  onSelectSubject: (subject: Subject | null) => void;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);

  // Institut tanlangan bo'lsa panel fanlar qavatida turadi.
  const showSubjects = university !== null;

  const universities = useGetUniversitiesQuery(
    {
      page,
      page_size: PAGE_SIZE,
      ordering: UNIVERSITY_PANEL_ORDERING.byAssignments,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    { skip: showSubjects },
  );

  const subjects = useGetSubjectsQuery(
    {
      page,
      page_size: PAGE_SIZE,
      ordering: 'name',
      university: university?.id ?? '',
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    { skip: !showSubjects },
  );

  const active = showSubjects ? subjects : universities;

  /**
   * Qavat almashganda sahifa va qidiruv boshidan boshlanadi.
   *
   * Fan bu yerda tozalanmaydi — buni `onSelectUniversity` ning o'zi qiladi.
   * Ikkalasini ketma-ket chaqirish chaqiruvchida muammo tug'dirardi: ikkinchi
   * chaqiruv hali yangilanmagan (eski) institutni ko'rib turadi va endigina
   * qo'yilgan tanlovni bekor qilardi.
   */
  function switchLevel(next: University | null) {
    onSelectUniversity(next);
    setPage(1);
    setSearch('');
  }

  return (
    <Card className="flex w-full shrink-0 flex-col lg:w-[300px]">
      <div className="border-b border-line p-4">
        {showSubjects ? (
          <button
            type="button"
            onClick={() => switchLevel(null)}
            className="flex w-full items-center gap-2 text-left text-sm font-semibold text-fg transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4 shrink-0" strokeWidth={2} />
            <span className="min-w-0 truncate">{university.short_name || university.name}</span>
          </button>
        ) : (
          <p className="text-sm font-semibold text-fg">Institutlar ro&apos;yxati</p>
        )}

        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={showSubjects ? 'Fan nomini qidiring...' : 'Institut nomini qidiring...'}
          className="mt-3"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {/*
          «Barchasi» qatori qidiruv yozilganda chizilmaydi: u paytda
          foydalanuvchi aniq yozuv qidiryapti va bu qator faqat
          natijalarni surib yuborardi.
        */}
        {!debouncedSearch && (
          <button
            type="button"
            onClick={() => (showSubjects ? onSelectSubject(null) : switchLevel(null))}
            aria-current={showSubjects ? subjectId === null : university === null}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
              (showSubjects ? subjectId === null : university === null)
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
                (showSubjects ? subjectId === null : university === null)
                  ? 'text-primary'
                  : 'text-fg',
              )}
            >
              {showSubjects ? 'Barcha fanlar' : 'Barcha institutlar'}
            </span>
          </button>
        )}

        {active.isLoading ? (
          Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-[68px] animate-pulse rounded-lg bg-elevated/60" />
          ))
        ) : showSubjects ? (
          (subjects.data?.results ?? []).length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-fg-muted">Fan topilmadi</p>
          ) : (
            (subjects.data?.results ?? []).map((item) => {
              const selected = item.id === subjectId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSubject(item)}
                  aria-current={selected}
                  className={cn(
                    'flex w-full flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-colors',
                    selected
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-transparent hover:border-line hover:bg-elevated/60',
                  )}
                >
                  <span
                    className={cn(
                      'w-full truncate text-[13px] font-semibold',
                      selected ? 'text-primary' : 'text-fg',
                    )}
                  >
                    {item.name}
                  </span>
                  <span className="mt-0.5 w-full truncate text-[11px] text-fg-muted">
                    {[
                      item.course ? `${item.course}-kurs` : null,
                      item.semester ? `${item.semester}-semestr` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Kurs ko‘rsatilmagan'}
                  </span>
                  <span className="mt-1 text-[11px] text-fg-dim">
                    {formatSom(item.assignment_count)} topshiriq
                  </span>
                </button>
              );
            })
          )
        ) : (universities.data?.results ?? []).length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-fg-muted">Institut topilmadi</p>
        ) : (
          (universities.data?.results ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => switchLevel(item)}
              className="flex w-full items-start gap-2.5 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-line hover:bg-elevated/60"
            >
              <UniversityBadge university={item} logo={item.logo} />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-fg">
                  {item.short_name || item.name}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-fg-muted">{item.name}</span>
                <span className="mt-1 block truncate text-[11px] text-fg-dim">
                  {universitySummary(item)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={active.data?.total_pages ?? 1} onPageChange={setPage} />
    </Card>
  );
}
