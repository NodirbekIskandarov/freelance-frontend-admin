import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { RowActions } from '@/components/ui/RowActions';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { VARIANT_ORDERING_OPTIONS, type Variant } from '@/shared/types/assignments';

import {
  useDeleteVariantMutation,
  useGetAssignmentsQuery,
  useGetVariantsQuery,
} from './assignmentsApi';
import { DeleteCatalogueModal } from '../catalogue/DeleteCatalogueModal';
import { VariantFormModal } from './VariantFormModal';

const activeOptions = [
  { value: 'all', label: 'Barchasi' },
  { value: 'true', label: 'Faol' },
  { value: 'false', label: 'Nofaol' },
];

export function VariantsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [assignment, setAssignment] = useState('all');
  const [active, setActive] = useState('all');
  const [ordering, setOrdering] = useState<string>('number');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Variant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Variant | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: assignments } = useGetAssignmentsQuery({ page_size: 200, ordering: 'title' });

  const { data, isLoading, isFetching, error } = useGetVariantsQuery({
    page,
    page_size: perPage,
    ordering,
    ...(assignment !== 'all' ? { assignment } : {}),
    ...(active !== 'all' ? { is_active: active === 'true' } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [deleteVariant, deleteState] = useDeleteVariantMutation();

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await deleteVariant(deleteTarget.id).unwrap();
    } catch {
      return;
    }

    setDeleteTarget(null);
  }

  const assignmentOptions = [
    { value: 'all', label: 'Barcha topshiriqlar' },
    ...(assignments?.results ?? []).map((item) => ({ value: item.id, label: item.title })),
  ];

  const columns: Column<Variant>[] = [
    {
      key: 'number',
      header: '№',
      className: 'w-16',
      cell: (row) => <span className="text-fg-soft tabular-nums">{row.number}</span>,
    },
    {
      key: 'label',
      header: 'Variant',
      cell: (row) => <span className="font-medium text-fg">{row.label}</span>,
    },
    {
      key: 'assignment_title',
      header: 'Topshiriq',
      className: 'max-w-[260px]',
      cell: (row) => (
        <span className="block truncate text-fg-soft" title={row.assignment_title}>
          {row.assignment_title}
        </span>
      ),
    },
    {
      key: 'request_count',
      header: "So'rovlar",
      align: 'right',
      /* Javob chop etilgan variantda so'rov kutish emas — topshiriqlar
         ro'yxatidagi «So'rovlar» ustuni bilan bir qoida. */
      cell: (row) =>
        row.published_solution_count > 0 ? (
          <Badge tone="success">Javob bor</Badge>
        ) : row.request_count > 0 ? (
          <Badge tone="warning">{row.request_count} ta</Badge>
        ) : (
          <span className="text-fg-dim">—</span>
        ),
    },
    {
      key: 'max_published_solutions',
      header: "Maks. e'lon",
      align: 'right',
      cell: (row) => <span className="tabular-nums">{row.max_published_solutions}</span>,
    },
    {
      key: 'is_active',
      header: 'Holat',
      cell: (row) => (
        <Badge tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? 'Faol' : 'Nofaol'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <RowActions
          inlineCount={1}
          actions={[
            {
              label: `${row.label} — tahrirlash`,
              icon: <Pencil className="size-4" strokeWidth={1.75} />,
              onSelect: () => {
                setEditTarget(row);
                setFormOpen(true);
              },
            },
            {
              label: `${row.label} — o'chirish`,
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
        title="Variantlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Variantlar' }]}
        actions={
          <Button
            icon={<Plus className="size-4" strokeWidth={2} />}
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            Yangi variant
          </Button>
        }
      />

      {error ? (
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Topshiriq bo'yicha filtr"
              options={assignmentOptions}
              value={assignment}
              onChange={(event) => {
                setAssignment(event.target.value);
                setPage(1);
              }}
              className="w-64"
            />
            <Select
              aria-label="Holat bo'yicha filtr"
              options={activeOptions}
              value={active}
              onChange={(event) => {
                setActive(event.target.value);
                setPage(1);
              }}
              className="w-40"
            />
            <Select
              aria-label="Saralash"
              options={[...VARIANT_ORDERING_OPTIONS]}
              value={ordering}
              onChange={(event) => {
                setOrdering(event.target.value);
                setPage(1);
              }}
              className="w-52"
            />

            <div className="ml-auto">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-72"
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
              emptyMessage="Bunday variant topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta variant` : undefined}
            />
          </Card>
        </>
      )}

      <VariantFormModal open={formOpen} variant={editTarget} onClose={() => setFormOpen(false)} />

      <DeleteCatalogueModal
        title="Variantni o'chirish"
        itemName={deleteTarget?.label ?? null}
        description="Variant katalogdan yashiriladi, lekin bazadan butunlay o'chmaydi — unga bog'langan yechimlar va sotuvlar tarixi saqlanib qoladi."
        isLoading={deleteState.isLoading}
        error={deleteState.error}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
