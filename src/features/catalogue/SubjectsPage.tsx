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
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { CATALOGUE_ORDERING_OPTIONS, type Subject } from '@/shared/types/catalogue';

import {
  useDeleteSubjectMutation,
  useGetSubjectsQuery,
  useGetUniversitiesQuery,
} from './catalogueApi';
import { DeleteCatalogueModal } from './DeleteCatalogueModal';
import { SubjectFormModal } from './SubjectFormModal';

const activeOptions = [
  { value: 'all', label: 'Barchasi' },
  { value: 'true', label: 'Faol' },
  { value: 'false', label: 'Nofaol' },
];

export function SubjectsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [university, setUniversity] = useState('all');
  const [active, setActive] = useState('all');
  const [ordering, setOrdering] = useState<string>('name');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: universities } = useGetUniversitiesQuery({
    page_size: 200,
    ordering: 'short_name',
  });

  const { data, isLoading, isFetching, error } = useGetSubjectsQuery({
    page,
    page_size: perPage,
    ordering,
    ...(university !== 'all' ? { university } : {}),
    ...(active !== 'all' ? { is_active: active === 'true' } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [deleteSubject, deleteState] = useDeleteSubjectMutation();

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await deleteSubject(deleteTarget.id).unwrap();
    } catch {
      return;
    }

    setDeleteTarget(null);
  }

  const universityOptions = [
    { value: 'all', label: 'Barcha institutlar' },
    ...(universities?.results ?? []).map((item) => ({
      value: item.id,
      label: item.short_name || item.name,
    })),
  ];

  const columns: Column<Subject>[] = [
    {
      key: 'name',
      header: 'Fan',
      className: 'max-w-[280px]',
      cell: (row) => (
        <span className="block truncate font-medium text-fg" title={row.name}>
          {row.name}
        </span>
      ),
    },
    {
      key: 'university_name',
      header: 'Institut',
      className: 'max-w-[220px]',
      cell: (row) => (
        <span className="block truncate text-fg-soft" title={row.university_name}>
          {row.university_name}
        </span>
      ),
    },
    {
      key: 'direction_name',
      header: "Yo'nalish",
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{row.direction_name || '—'}</span>
      ),
    },
    {
      key: 'course',
      header: 'Kurs',
      align: 'center',
      cell: (row) => (
        <span className="tabular-nums">{row.course === null ? '—' : `${row.course}`}</span>
      ),
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
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          <IconButton
            label={`${row.name} — tahrirlash`}
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
            label={`${row.name} — o'chirish`}
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
        title="Fanlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Fanlar' }]}
        actions={
          <Button
            icon={<Plus className="size-4" strokeWidth={2} />}
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            Yangi fan
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
            <Select
              aria-label="Institut bo'yicha filtr"
              options={universityOptions}
              value={university}
              onChange={(event) => {
                setUniversity(event.target.value);
                setPage(1);
              }}
              className="w-56"
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
              options={[...CATALOGUE_ORDERING_OPTIONS]}
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
              isLoading={isLoading || isFetching}
              skeletonRows={perPage > 20 ? 20 : perPage}
              emptyMessage="Bunday fan topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta fan` : undefined}
            />
          </Card>
        </>
      )}

      <SubjectFormModal open={formOpen} subject={editTarget} onClose={() => setFormOpen(false)} />

      <DeleteCatalogueModal
        title="Fanni o'chirish"
        itemName={deleteTarget?.name ?? null}
        description="Fan katalogdan yashiriladi, lekin bazadan butunlay o'chmaydi — unga bog'langan topshiriqlar va yechimlar tarixi saqlanib qoladi."
        isLoading={deleteState.isLoading}
        error={deleteState.error}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
