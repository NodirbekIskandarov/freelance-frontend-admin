import { Building2, FileText, Pencil, Plus, SearchX, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { Link } from '@/i18n/navigation';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DateCell, NumberCell } from '@/components/ui/Cells';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { RowActions } from '@/components/ui/RowActions';
import { Table, type Column } from '@/components/ui/Table';
import { TableToolbar } from '@/components/ui/TableToolbar';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { CATALOGUE_ORDERING_OPTIONS, type University } from '@/shared/types/catalogue';

import { useGetUniversityRequestsListQuery } from '@/features/adminRequests/adminRequestsApi';

import { useDeleteUniversityMutation, useGetUniversitiesQuery } from './catalogueApi';
import { DeleteCatalogueModal } from './DeleteCatalogueModal';
import { UniversityBadge } from './UniversityPanel';
import { UniversityFormModal } from './UniversityFormModal';

const activeOptions = [
  { value: 'all', label: 'Barchasi' },
  { value: 'true', label: 'Faol' },
  { value: 'false', label: 'Nofaol' },
];

export function InstitutesPage() {
  /*
   * Javob kutayotgan arizalar SONI — `page_size: 1` bilan.
   *
   * Ro'yxatning o'zi kerak emas, faqat `count`. Fanlar ekranida ham
   * shu naqsh: tugmadagi raqamsiz navbat borligi ekranga kirmaguncha
   * bilinmasdi.
   */
  const { data: pendingRequests } = useGetUniversityRequestsListQuery({
    status: 'pending',
    page: 1,
    page_size: 1,
  });
  const pendingCount = pendingRequests?.count ?? 0;

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [city, setCity] = useState('all');
  const [active, setActive] = useState('all');
  const [ordering, setOrdering] = useState<string>('name');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<University | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<University | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error, refetch } = useGetUniversitiesQuery({
    page,
    page_size: perPage,
    ordering,
    ...(city !== 'all' ? { city } : {}),
    ...(active !== 'all' ? { is_active: active === 'true' } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  /*
   * Viloyatlar ro'yxati institutlarning o'zidan yig'iladi — backendda
   * alohida "viloyatlar" ma'lumotnomasi yo'q. Joriy sahifadan olish
   * yaramaydi: u faqat 10-20 qatorni ko'radi va ro'yxat sahifa
   * almashgani sayin o'zgarib turardi.
   */
  const { data: allUniversities } = useGetUniversitiesQuery({ page: 1, page_size: 200 });

  const cityOptions = [
    { value: 'all', label: 'Barcha viloyatlar' },
    ...[...new Set((allUniversities?.results ?? []).map((item) => item.city).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'uz'))
      .map((item) => ({ value: item, label: item })),
  ];

  const [deleteUniversity, deleteState] = useDeleteUniversityMutation();

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await deleteUniversity(deleteTarget.id).unwrap();
    } catch {
      return;
    }

    setDeleteTarget(null);
  }

  /*
   * Nechta filtr sukut qiymatidan farq qiladi.
   *
   * Saralash HISOBGA OLINMAYDI: u ro'yxatni qisqartirmaydi, faqat
   * tartibini o'zgartiradi — «filtr faol» deb ko'rsatilsa, bo'sh
   * natijaning sababini u yerdan qidirishga majbur qilardi.
   */
  const activeFilterCount = [
    search,
    city !== 'all' ? city : '',
    active !== 'all' ? active : '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  function resetFilters() {
    setSearch('');
    setCity('all');
    setActive('all');
    setPage(1);
  }

  const columns: Column<University>[] = [
    {
      key: 'index',
      header: '#',
      /* Kim haqidagi qator ekanini bildiradigan ikki ustun chapga
         yopishadi: usiz o'ngga surilgan jadvalda «Faol» va sana
         qatorlari kimga tegishli ekani ko'rinmay qolardi. */
      stickyLeft: true,
      className: 'left-0 w-12 tabular-nums text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      header: 'Institut nomi',
      stickyLeft: true,
      className: 'left-12 max-w-[280px]',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <UniversityBadge university={row} logo={row.logo} />
          <span className="block min-w-0 truncate font-medium text-fg" title={row.name}>
            {row.name}
          </span>
        </span>
      ),
    },
    {
      key: 'short_name',
      header: 'Qisqartma',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft">{row.short_name || '—'}</span>
      ),
    },
    {
      key: 'city',
      header: 'Viloyat',
      cell: (row) => <span className="whitespace-nowrap text-fg-soft">{row.city || '—'}</span>,
    },
    {
      key: 'subject_count',
      header: 'Fanlar soni',
      align: 'right',
      cell: (row) => <NumberCell>{formatSom(row.subject_count)}</NumberCell>,
    },
    {
      key: 'assignment_count',
      header: 'Topshiriqlar',
      align: 'right',
      cell: (row) => <NumberCell>{formatSom(row.assignment_count)}</NumberCell>,
    },
    {
      key: 'is_active',
      header: 'Status',
      cell: (row) => (
        <Badge tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? 'Faol' : 'Nofaol'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: "Qo'shilgan sana",
      cell: (row) => <DateCell value={row.created_at} />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      /*
        Tahrirlash tashqarida, o'chirish `⋯` ichida.

        Ilgari ikkalasi yonma-yon, bir xil o'lchamda turardi va o'chirish
        tugmasi tahrirlashdan 8px narida edi — qaytarib bo'lmaydigan amal
        uchun bu juda yaqin masofa.
      */
      cell: (row) => (
        <RowActions
          inlineCount={1}
          actions={[
            {
              label: `${row.short_name || row.name} — tahrirlash`,
              icon: <Pencil className="size-4" strokeWidth={1.75} />,
              onSelect: () => {
                setEditTarget(row);
                setFormOpen(true);
              },
            },
            {
              label: `${row.short_name || row.name} — o'chirish`,
              icon: <Trash2 className="size-4" strokeWidth={1.75} />,
              onSelect: () => setDeleteTarget(row),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Institutlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Institutlar' }]}
        actions={
          <>
            {/*
              Arizalar MENYUDA emas, shu yerda: ular institutlar bo'limining
              bir qismi va alohida band bitta ish oqimini ikki joyga
              uzoqlashtirardi. Fan va topshiriq arizalari ham xuddi shunday
              o'z ekranidan ochiladi.
            */}
            <Link to="/institutlar/arizalar">
              <Button variant="secondary" icon={<FileText className="size-4" />}>
                Institut qo&apos;shish arizalari
                {pendingCount > 0 && (
                  <span
                    aria-label={`${pendingCount} ta ariza javob kutmoqda`}
                    className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-warning/20 px-1.5 py-0.5 text-[11px] font-semibold text-warning tabular-nums"
                  >
                    {pendingCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              icon={<Plus className="size-4" strokeWidth={2} />}
              onClick={() => {
                setEditTarget(null);
                setFormOpen(true);
              }}
            >
              Yangi institut qo&apos;shish
            </Button>
          </>
        }
      />

      {error ? (
        <Card>
          <EmptyState
            icon={TriangleAlert}
            tone="danger"
            title="Ro'yxat yuklanmadi"
            description={getApiErrorMessage(error)}
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                Qayta urinish
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <TableToolbar
            activeFilters={activeFilterCount}
            onResetFilters={resetFilters}
            search={
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Qidirish (nom, qisqartma...)"
                className="w-full sm:w-72"
              />
            }
            filters={
              <>
                <Select
                  aria-label="Viloyat bo'yicha filtr"
                  options={cityOptions}
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value);
                    setPage(1);
                  }}
                  /* Viloyatlar ko'p — aylantirishdan ko'ra yozib topish tezroq. */
                  searchable={cityOptions.length > 8}
                  searchPlaceholder="Viloyat nomi..."
                  className="w-52"
                />

                <Select
                  aria-label="Status bo'yicha filtr"
                  options={activeOptions}
                  value={active}
                  onChange={(event) => {
                    setActive(event.target.value);
                    setPage(1);
                  }}
                  className="w-44"
                />
              </>
            }
            actions={
              <Select
                aria-label="Saralash"
                options={[...CATALOGUE_ORDERING_OPTIONS]}
                value={ordering}
                onChange={(event) => {
                  setOrdering(event.target.value);
                  setPage(1);
                }}
                className="w-52"
              />
            }
          />

          <Card className="mt-4 overflow-hidden">
            <Table
              columns={columns}
              rows={data?.results ?? []}
              rowKey={(row) => row.id}
              /*
                Skeleton faqat ko'rsatadigan narsa bo'lmaganda: sahifa yoki
                filtr almashsa `data` bo'shaydi, mutatsiyadan keyingi fon
                yangilanishida esa joyida qoladi va jadval miltillamaydi.
              */
              isLoading={isLoading || (isFetching && !data)}
              skeletonRows={perPage > 20 ? 20 : perPage}
              empty={
                hasFilters ? (
                  <EmptyState
                    icon={SearchX}
                    title="Bunday institut topilmadi"
                    description="Qidiruv so'zini o'zgartiring yoki filtrlarni tozalang."
                    action={
                      <Button variant="secondary" size="sm" onClick={resetFilters}>
                        Filtrlarni tozalash
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={Building2}
                    title="Katalogda hali institut yo'q"
                    description="Birinchi institutni qo'shsangiz, fanlar va topshiriqlar unga bog'lanadi."
                    action={
                      <Button
                        size="sm"
                        icon={<Plus className="size-4" strokeWidth={2} />}
                        onClick={() => {
                          setEditTarget(null);
                          setFormOpen(true);
                        }}
                      >
                        Yangi institut qo&apos;shish
                      </Button>
                    }
                  />
                )
              }
            />

            <Pagination
              page={page}
              totalPages={data?.total_pages ?? 1}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              summary={data ? `Jami ${formatSom(data.count)} ta institut` : undefined}
            />
          </Card>
        </>
      )}

      <UniversityFormModal
        open={formOpen}
        university={editTarget}
        onClose={() => setFormOpen(false)}
      />

      <DeleteCatalogueModal
        title="Institutni o'chirish"
        itemName={deleteTarget ? deleteTarget.short_name || deleteTarget.name : null}
        description="Institut katalogdan yashiriladi, lekin bazadan butunlay o'chmaydi — unga bog'langan fanlar, topshiriqlar va yechimlar tarixi saqlanib qoladi."
        isLoading={deleteState.isLoading}
        error={deleteState.error}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
