import { Check, Eye, Filter, Landmark, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column, type SortState } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { InstituteRequest } from '@/shared/types/institutes';

import { useGetInstituteRequestsQuery } from './institutesApi';

const statusOptions = [
  { value: 'all', label: 'Barcha statuslar' },
  { value: 'Kutilmoqda', label: 'Kutilmoqda' },
  { value: 'Tasdiqlangan', label: 'Tasdiqlangan' },
  { value: 'Rad etilgan', label: 'Rad etilgan' },
];

export function InstituteRequestsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<SortState | undefined>({ key: 'date', direction: 'desc' });

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error, refetch } = useGetInstituteRequestsQuery({
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    region: region === 'all' ? undefined : region,
    status: status === 'all' ? undefined : status,
  });

  const resetToFirstPage = () => setPage(1);

  const columns: Column<InstituteRequest>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      header: 'Institut nomi',
      className: 'max-w-[200px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block text-fg">{row.name}</span>
          <span className="block text-xs text-fg-muted">{row.short}</span>
        </span>
      ),
    },
    {
      key: 'region',
      header: 'Viloyat',
      className: 'max-w-[110px]',
      cell: (row) => <span className="block leading-snug">{row.region}</span>,
    },
    {
      key: 'requester',
      header: 'Foydalanuvchi',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={row.requester.name} src={row.requester.avatarUrl} size="sm" />
          <span className="min-w-0 leading-snug">
            <span className="block whitespace-nowrap text-fg">{row.requester.name}</span>
            <span className="block truncate text-xs text-fg-muted">{row.requester.username}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefon',
      cell: (row) => <span className="whitespace-nowrap">{row.phone}</span>,
    },
    {
      key: 'date',
      header: 'Ariza sanasi',
      sortable: true,
      cell: (row) => (
        <span className="block leading-snug whitespace-nowrap">
          <span className="block text-fg-soft">{row.date}</span>
          <span className="block text-xs text-fg-muted">{row.time}</span>
        </span>
      ),
    },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'comment',
      header: 'Izoh',
      className: 'max-w-[170px]',
      cell: (row) => <span className="block leading-snug text-fg-muted">{row.comment}</span>,
    },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <IconButton label={`${row.short} — ko'rish`} size="sm">
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>

          {/* Qaror qabul qilinmagan arizadagina tasdiqlash/rad etish ko'rinadi. */}
          {row.status === 'Kutilmoqda' && (
            <>
              <IconButton label={`${row.short} — tasdiqlash`} tone="success" size="sm">
                <Check className="size-4" strokeWidth={2} />
              </IconButton>
              <IconButton label={`${row.short} — rad etish`} tone="danger" size="sm">
                <X className="size-4" strokeWidth={2} />
              </IconButton>
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Institut qo‘shish arizalari"
        breadcrumbs={[
          { label: 'Bosh sahifa', to: '/' },
          { label: 'Kontent boshqaruvi', to: '/kontent' },
          { label: 'Institutlar', to: '/institutlar' },
          { label: "Institut qo'shish arizalari" },
        ]}
        actions={
          <Button
            variant="secondary"
            icon={<Landmark className="size-4" strokeWidth={1.75} />}
            onClick={() => navigate('/institutlar')}
          >
            Institutlar ro‘yxatiga o‘tish
          </Button>
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Qidirish (institut nomi, foydalanuvchi...)"
              iconPosition="right"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetToFirstPage();
              }}
              className="min-w-[260px] flex-1"
            />
            <Select
              aria-label="Viloyat bo'yicha filtr"
              options={[
                { value: 'all', label: 'Barcha viloyatlar' },
                ...(data?.regions ?? []).map((item) => ({ value: item, label: item })),
              ]}
              value={region}
              onChange={(event) => {
                setRegion(event.target.value);
                resetToFirstPage();
              }}
              className="w-52"
            />
            <Select
              aria-label="Status bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                resetToFirstPage();
              }}
              className="w-48"
            />
            <Button variant="secondary" icon={<Filter className="size-4" strokeWidth={1.75} />}>
              Filtr
            </Button>

            <IconButton label="Yangilash" size="lg" onClick={() => void refetch()}>
              <RefreshCw className="size-4" strokeWidth={1.75} />
            </IconButton>
          </section>

          <Card className="overflow-hidden">
            <Table
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              isLoading={isLoading || isFetching}
              skeletonRows={perPage}
              density="compact"
              sort={sort}
              onSortChange={(key) =>
                setSort((current) =>
                  current?.key === key
                    ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
                    : { key, direction: 'desc' },
                )
              }
              emptyMessage="Bunday ariza topilmadi"
            />

            <Pagination
              page={page}
              totalPages={data?.pagination.totalPages ?? 1}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                resetToFirstPage();
              }}
              perPageOptions={[10, 20, 50]}
              summary={data ? `Jami ${formatSom(data.pagination.total)} ta ariza` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
