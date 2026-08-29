import { CircleCheck, CirclePause, CirclePlay, CircleX, Clock, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { formatDecimalSom, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import {
  AVAILABILITY_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  FREELANCER_STATUS_LABELS,
  WORK_DIRECTION_LABELS,
  type AdminFreelancer,
  type FreelancerStatus,
} from '@/shared/types/adminFreelance';

import {
  useGetFreelancerStatsQuery,
  useGetFreelancersQuery,
  useReinstateFreelancerMutation,
  useSuspendFreelancerMutation,
} from './adminFreelanceApi';

const statusTones: Record<FreelancerStatus, BadgeTone> = {
  none: 'neutral',
  pending: 'warning',
  active: 'success',
  suspended: 'orange',
  rejected: 'danger',
};

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  { value: 'active', label: 'Faol' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'suspended', label: "To'xtatilgan" },
  { value: 'rejected', label: 'Rad etilgan' },
];

export function FreelancersPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: stats } = useGetFreelancerStatsQuery();
  const { data, isLoading, isFetching, error } = useGetFreelancersQuery({
    page,
    page_size: perPage,
    ordering: '-created_at',
    ...(status !== 'all' ? { status: status as FreelancerStatus } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [suspend, suspendState] = useSuspendFreelancerMutation();
  const [reinstate, reinstateState] = useReinstateFreelancerMutation();

  const actionError = suspendState.error ?? reinstateState.error;
  const isActing = suspendState.isLoading || reinstateState.isLoading;

  const columns: Column<AdminFreelancer>[] = [
    {
      key: 'direction',
      header: 'Mutaxassislik',
      cell: (row) => (
        <span className="block">
          <span className="block font-medium text-fg">
            {WORK_DIRECTION_LABELS[row.direction] ?? row.direction}
          </span>
          <span className="block text-xs text-fg-muted">
            {EXPERIENCE_LEVEL_LABELS[row.experience_level] ?? row.experience_level}
          </span>
        </span>
      ),
    },
    {
      key: 'skills',
      header: "Ko'nikmalar",
      className: 'max-w-[220px]',
      cell: (row) => (
        <span className="block truncate text-fg-soft" title={row.skills.join(', ')}>
          {row.skills.length > 0 ? row.skills.join(', ') : '—'}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'Shahar',
      cell: (row) => <span className="whitespace-nowrap text-fg-muted">{row.city || '—'}</span>,
    },
    {
      key: 'jobs',
      header: 'Ishlar',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">
          {row.completed_jobs}
          <span className="text-fg-muted"> / {row.active_jobs} faol</span>
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Reyting',
      align: 'right',
      cell: (row) => <span className="tabular-nums">{Number(row.rating).toFixed(1)}</span>,
    },
    {
      key: 'total_earn',
      header: 'Daromad',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatDecimalSom(row.total_earn)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <Badge tone={statusTones[row.status]}>{FREELANCER_STATUS_LABELS[row.status]}</Badge>
          {row.status === 'active' && (
            <Badge tone={row.availability === 'available' ? 'success' : 'orange'}>
              {AVAILABILITY_LABELS[row.availability]}
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          {row.status === 'active' && (
            <IconButton
              label="Vaqtincha to'xtatish"
              tone="danger"
              size="sm"
              disabled={isActing}
              onClick={() => void suspend(row.id)}
            >
              <CirclePause className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
          {row.status === 'suspended' && (
            <IconButton
              label="Tiklash"
              tone="success"
              size="sm"
              disabled={isActing}
              onClick={() => void reinstate(row.id)}
            >
              <CirclePlay className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Freelancerlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Freelancerlar' }]}
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          {actionError !== undefined && actionError !== null && (
            <div className="mb-4 rounded-card border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
              {getApiErrorMessage(actionError)}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami"
              value={stats ? formatSom(stats.total) : '—'}
              icon={Users}
              tone="info"
            />
            <StatCard
              label="Faol"
              value={stats ? formatSom(stats.active) : '—'}
              icon={CircleCheck}
              tone="success"
            />
            <StatCard
              label="Kutilmoqda"
              value={stats ? formatSom(stats.pending) : '—'}
              icon={Clock}
              tone="warning"
            />
            <StatCard
              label="To'xtatilgan"
              value={stats ? formatSom(stats.suspended) : '—'}
              icon={CircleX}
              tone="danger"
            />
          </section>

          <section className="mt-4 flex flex-wrap items-center gap-3">
            <Select
              aria-label="Holat bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="w-48"
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
              density="compact"
              emptyMessage="Bunday freelancer topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta freelancer` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
