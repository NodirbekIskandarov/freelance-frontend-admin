import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { CATALOGUE_ORDERING_OPTIONS, type University } from '@/shared/types/catalogue';

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

  const { data, isLoading, isFetching, error } = useGetUniversitiesQuery({
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

  const columns: Column<University>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-12 tabular-nums text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      header: 'Institut nomi',
      className: 'max-w-[280px]',
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
      align: 'center',
      cell: (row) => <span className="tabular-nums">{formatSom(row.subject_count)}</span>,
    },
    {
      key: 'assignment_count',
      header: 'Topshiriqlar',
      align: 'center',
      cell: (row) => <span className="tabular-nums">{formatSom(row.assignment_count)}</span>,
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
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          <IconButton
            label={`${row.short_name || row.name} — tahrirlash`}
            tone="warning"
            size="sm"
            onClick={() => {
              setEditTarget(row);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.short_name || row.name} — o'chirish`}
            tone="danger"
            size="sm"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Institutlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Institutlar' }]}
        actions={
          <Button
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

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Qidirish (nom, qisqartma...)"
              className="w-full sm:w-72"
            />

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

            <div className="ml-auto">
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
            </div>
          </section>

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
              emptyMessage="Bunday institut topilmadi"
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
