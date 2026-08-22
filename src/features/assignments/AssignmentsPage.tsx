import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

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
import { ASSIGNMENT_ORDERING_OPTIONS, type Assignment } from '@/shared/types/assignments';

import { AssignmentFormModal } from './AssignmentFormModal';
import { useGetAssignmentsQuery, useGetSubjectsQuery } from './assignmentsApi';
import { DeleteAssignmentModal } from './DeleteAssignmentModal';

const activeOptions = [
  { value: 'all', label: 'Barchasi' },
  { value: 'true', label: 'Faol' },
  { value: 'false', label: 'Nofaol' },
];

export function AssignmentsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [subject, setSubject] = useState('all');
  const [active, setActive] = useState('all');
  const [ordering, setOrdering] = useState<string>('-created_at');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Assignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: subjects } = useGetSubjectsQuery({ page_size: 200, ordering: 'name' });

  const { data, isLoading, isFetching, error } = useGetAssignmentsQuery({
    page,
    page_size: perPage,
    ordering,
    ...(subject !== 'all' ? { subject } : {}),
    ...(active !== 'all' ? { is_active: active === 'true' } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const subjectOptions = [
    { value: 'all', label: 'Barcha fanlar' },
    ...(subjects?.results ?? []).map((item) => ({ value: item.id, label: item.name })),
  ];

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(assignment: Assignment) {
    setEditTarget(assignment);
    setFormOpen(true);
  }

  const columns: Column<Assignment>[] = [
    {
      key: 'title',
      header: 'Topshiriq',
      className: 'max-w-[300px]',
      cell: (row) => (
        <span className="block">
          <span className="block truncate text-fg" title={row.title}>
            {row.title}
          </span>
          {row.description && (
            <span className="mt-0.5 block truncate text-xs text-fg-muted" title={row.description}>
              {row.description}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'subject_name',
      header: 'Fan',
      cell: (row) => <span className="whitespace-nowrap text-fg-soft">{row.subject_name}</span>,
    },
    {
      key: 'university_name',
      header: 'Universitet',
      className: 'max-w-[200px]',
      cell: (row) => (
        <span className="block truncate text-fg-muted" title={row.university_name}>
          {row.university_name}
        </span>
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
      key: 'created_at',
      header: 'Yaratilgan',
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
            label={`${row.title} — variantlar`}
            tone="success"
            size="sm"
            onClick={() => void navigate(`/topshiriqlar/${row.id}`)}
          >
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.title} — tahrirlash`}
            tone="warning"
            size="sm"
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.title} — o'chirish`}
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
        title="Topshiriqlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Topshiriqlar' }]}
        actions={
          <Button icon={<Plus className="size-4" strokeWidth={2} />} onClick={openCreate}>
            Yangi topshiriq
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
              aria-label="Fan bo'yicha filtr"
              options={subjectOptions}
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
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
              options={[...ASSIGNMENT_ORDERING_OPTIONS]}
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
              emptyMessage="Bunday topshiriq topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta topshiriq` : undefined}
            />
          </Card>
        </>
      )}

      <AssignmentFormModal
        open={formOpen}
        assignment={editTarget}
        onClose={() => setFormOpen(false)}
      />
      <DeleteAssignmentModal assignment={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </>
  );
}
