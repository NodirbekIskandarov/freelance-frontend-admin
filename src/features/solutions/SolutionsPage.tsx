import { Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime, formatDecimalSom, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { SOLUTION_ORDERING_OPTIONS, type Solution } from '@/shared/types/solutions';

import { SolutionStatusBadge } from './SolutionStatusBadge';
import { useGetPendingSolutionsQuery } from './solutionsApi';

export function SolutionsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [ordering, setOrdering] = useState<string>('-created_at');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetPendingSolutionsQuery({
    page,
    page_size: perPage,
    ordering,
    search: debouncedSearch || undefined,
  });

  const columns: Column<Solution>[] = [
    {
      key: 'title',
      header: 'Yechim',
      className: 'max-w-[280px]',
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
      key: 'variant_label',
      header: 'Variant',
      cell: (row) => <span className="whitespace-nowrap text-fg-soft">{row.variant_label}</span>,
    },
    {
      key: 'price',
      header: 'Narx',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatDecimalSom(row.price)}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Yuborilgan',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <SolutionStatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <IconButton
          label={`${row.title} — ko'rish`}
          tone="success"
          size="sm"
          onClick={() => void navigate(`/yechimlar/${row.id}`)}
        >
          <Eye className="size-4" strokeWidth={1.75} />
        </IconButton>
      ),
    },
  ];

  const total = data?.count ?? 0;
  const totalPages = data?.total_pages ?? 1;

  return (
    <>
      <PageHeader
        title="Yechim moderatsiyasi"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Yechimlar' }]}
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Saralash"
              options={[...SOLUTION_ORDERING_OPTIONS]}
              value={ordering}
              onChange={(event) => {
                setOrdering(event.target.value);
                setPage(1);
              }}
              className="w-56"
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
              onRowClick={(row) => void navigate(`/yechimlar/${row.id}`)}
              emptyMessage="Moderatsiya kutayotgan yechim yo'q"
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              summary={data ? `Jami ${formatSom(total)} ta yechim kutilmoqda` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
