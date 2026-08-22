import { Banknote, CircleCheck, ClipboardList, Eye, ShieldAlert, Undo2 } from 'lucide-react';
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
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type AdminTask,
  type TaskStatus,
} from '@/shared/types/adminExchange';
import {
  WORK_DIRECTION_LABELS,
  WORK_DIRECTIONS,
  type WorkDirection,
} from '@/shared/types/adminFreelance';

import { RefundTaskModal } from './RefundTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { useGetAdminTasksQuery, useGetAdminTaskStatsQuery } from './adminExchangeApi';

const statusTones: Record<TaskStatus, BadgeTone> = {
  open: 'info',
  in_progress: 'warning',
  delivered: 'purple',
  completed: 'success',
  cancelled: 'danger',
};

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  ...TASK_STATUSES.map((value) => ({ value, label: TASK_STATUS_LABELS[value] })),
];

const directionOptions = [
  { value: 'all', label: "Barcha yo'nalishlar" },
  ...WORK_DIRECTIONS.map((value) => ({ value, label: WORK_DIRECTION_LABELS[value] })),
];

/** Kafolatdagi pul faqat shu holatlarda turadi — qaytarish ham shunda. */
const REFUNDABLE: TaskStatus[] = ['in_progress', 'delivered'];

export function ExchangeTasksPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState('all');
  const [direction, setDirection] = useState('all');
  const [search, setSearch] = useState('');
  const [detailTask, setDetailTask] = useState<AdminTask | null>(null);
  const [refundTask, setRefundTask] = useState<AdminTask | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: stats } = useGetAdminTaskStatsQuery();
  const { data, isLoading, isFetching, error } = useGetAdminTasksQuery({
    page,
    page_size: perPage,
    ordering: '-created_at',
    ...(status !== 'all' ? { status: status as TaskStatus } : {}),
    ...(direction !== 'all' ? { direction: direction as WorkDirection } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const columns: Column<AdminTask>[] = [
    {
      key: 'title',
      header: 'Topshiriq',
      className: 'max-w-[280px]',
      cell: (row) => (
        <span className="block">
          <span className="block truncate font-medium text-fg" title={row.title}>
            {row.title}
          </span>
          <span className="block text-xs text-fg-muted">
            {WORK_DIRECTION_LABELS[row.direction] ?? row.direction} · {row.reference}
          </span>
        </span>
      ),
    },
    {
      key: 'client',
      header: 'Mijoz',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft">{row.client?.full_name ?? '—'}</span>
      ),
    },
    {
      key: 'freelancer',
      header: 'Bajaruvchi',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft">
          {row.freelancer?.full_name ?? `${row.offer_count} ta taklif`}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Summa',
      align: 'right',
      cell: (row) => (
        <span className="block text-right whitespace-nowrap">
          <span className="block font-medium text-fg tabular-nums">
            {formatDecimalSom(row.agreed_price ?? row.budget)}
          </span>
          {row.commission_amount && (
            <span className="block text-xs text-fg-muted">
              komissiya: {formatDecimalSom(row.commission_amount)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Muddat',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted tabular-nums">
          {row.agreed_deadline_days ?? row.deadline_days} kun
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => <Badge tone={statusTones[row.status]}>{TASK_STATUS_LABELS[row.status]}</Badge>,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          <IconButton label="Batafsil" tone="info" size="sm" onClick={() => setDetailTask(row)}>
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          {REFUNDABLE.includes(row.status) && (
            <IconButton
              label="Pulni mijozga qaytarish"
              tone="danger"
              size="sm"
              onClick={() => setRefundTask(row)}
            >
              <Undo2 className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Birja nazorati"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Birja nazorati' }]}
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami topshiriq"
              value={stats ? formatSom(stats.total) : '—'}
              icon={ClipboardList}
              tone="info"
            />
            <StatCard
              label="Bajarilmoqda"
              value={stats ? formatSom(stats.in_progress + stats.delivered) : '—'}
              icon={ShieldAlert}
              tone="warning"
            />
            <StatCard
              label="Kafolatdagi pul"
              value={stats ? formatDecimalSom(stats.escrow_held) : '—'}
              icon={Banknote}
              tone="purple"
            />
            <StatCard
              label="Komissiya"
              value={stats ? formatDecimalSom(stats.commission_earned) : '—'}
              icon={CircleCheck}
              tone="success"
              caption={
                stats ? { text: `${stats.completed} ta yakunlandi`, tone: 'muted' } : undefined
              }
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
            <Select
              aria-label="Yo'nalish bo'yicha filtr"
              options={directionOptions}
              value={direction}
              onChange={(event) => {
                setDirection(event.target.value);
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
              density="compact"
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

      <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
      <RefundTaskModal task={refundTask} onClose={() => setRefundTask(null)} />
    </>
  );
}
