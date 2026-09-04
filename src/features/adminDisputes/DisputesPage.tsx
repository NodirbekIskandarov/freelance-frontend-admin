import { ChevronRight, Clock, CircleCheck, CircleX, Scale } from 'lucide-react';
import { useState } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PersonCell } from '@/components/ui/PersonCell';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { useLocaleNavigate } from '@/i18n/navigation';
import { formatDateTime, formatDecimalSom, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import {
  DISPUTE_REASON_LABELS,
  DISPUTE_REASONS,
  DISPUTE_STATUS_LABELS,
  DISPUTE_STATUSES,
  type Dispute,
  type DisputeReason,
  type DisputeStatus,
} from '@/shared/types/disputes';

import { useGetDisputeStatsQuery, useGetDisputesQuery } from './disputesApi';

export const disputeTones: Record<DisputeStatus, BadgeTone> = {
  pending: 'warning',
  answered: 'info',
  resolved: 'success',
  rejected: 'neutral',
};

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  ...DISPUTE_STATUSES.map((value) => ({ value, label: DISPUTE_STATUS_LABELS[value] })),
];

const reasonOptions = [
  { value: 'all', label: 'Barcha sabablar' },
  ...DISPUTE_REASONS.map((value) => ({ value, label: DISPUTE_REASON_LABELS[value] })),
];

/**
 * Muallif javob berishi kerak bo'lgan vaqtdan qancha qolgani.
 *
 * Muddat o'tgani MUHIM: undan keyin moderator muallifni kutmasdan qaror
 * qabul qilishi mumkin, va navbatda aynan shular birinchi ko'rilishi kerak.
 */
function deadlineLabel(iso: string): { text: string; overdue: boolean } {
  const left = new Date(iso).getTime() - Date.now();
  if (left <= 0) return { text: "muddat o'tdi", overdue: true };

  const hours = Math.floor(left / 3_600_000);
  if (hours >= 1) return { text: `${hours} soat qoldi`, overdue: false };
  return { text: `${Math.max(1, Math.round(left / 60_000))} daqiqa qoldi`, overdue: false };
}

export function DisputesPage() {
  const navigate = useLocaleNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState('all');
  const [reason, setReason] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetDisputesQuery({
    page,
    page_size: perPage,
    ...(status !== 'all' ? { status: status as DisputeStatus } : {}),
    ...(reason !== 'all' ? { reason: reason as DisputeReason } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const stats = useGetDisputeStatsQuery();

  const columns: Column<Dispute>[] = [
    {
      key: 'solution',
      header: 'Xarid',
      className: 'max-w-[240px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block truncate text-fg" title={row.solution_title}>
            {row.solution_title}
          </span>
          <span className="block truncate text-xs text-fg-muted">
            {DISPUTE_REASON_LABELS[row.reason] ?? row.reason}
          </span>
        </span>
      ),
    },
    {
      key: 'buyer',
      header: 'Xaridor',
      className: 'max-w-[180px]',
      cell: (row) => <PersonCell name={row.buyer?.full_name} phone={row.buyer?.phone} />,
    },
    {
      key: 'seller',
      header: 'Muallif',
      className: 'max-w-[180px]',
      cell: (row) => <PersonCell name={row.seller?.full_name} phone={row.seller?.phone} />,
    },
    {
      key: 'amount',
      header: 'Summa',
      align: 'right',
      cell: (row) => (
        <span className="block leading-snug whitespace-nowrap tabular-nums">
          <span className="block text-fg">{formatDecimalSom(row.unit_price)}</span>
          {/* Ushlab turilgan pul — qaror aynan shunga tegadi. */}
          {row.earning_held && (
            <span className="block text-xs text-warning">
              {formatDecimalSom(row.seller_earning)} hold
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Muddat',
      cell: (row) => {
        if (row.status === 'resolved' || row.status === 'rejected') {
          return (
            <span className="whitespace-nowrap text-fg-muted">
              {formatDateTime(row.resolved_at)}
            </span>
          );
        }
        const { text, overdue } = deadlineLabel(row.respond_deadline);
        return (
          <span
            className={`whitespace-nowrap ${overdue ? 'font-medium text-danger' : 'text-fg-muted'}`}
          >
            {text}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <Badge tone={disputeTones[row.status]}>
          {DISPUTE_STATUS_LABELS[row.status] ?? row.status}
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
        <IconButton
          label={`${row.solution_title} — ochish`}
          size="sm"
          onClick={() => navigate(`/xarid-shikoyatlari/${row.id}`)}
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Xarid shikoyatlari"
        subtitle="Sotib olingan yechim bo'yicha nizolar — qaror pulni harakatga keltiradi."
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Xarid shikoyatlari' }]}
      />

      {error ? (
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Ochiq"
              value={formatSom(stats.data?.open ?? 0)}
              icon={Clock}
              tone="warning"
            />
            <StatCard
              label="Hal qilingan"
              value={formatSom(stats.data?.resolved ?? 0)}
              icon={CircleCheck}
              tone="success"
            />
            <StatCard
              label="Rad etilgan"
              value={formatSom(stats.data?.rejected ?? 0)}
              icon={CircleX}
              tone="danger"
            />
            {/* O'lchangan raqamlar, bezak emas: «xaridlarning 1.8%i
                shikoyatga aylanadi» — bu holatni baholaydigan yagona son. */}
            <StatCard
              label="Xaridlardagi ulushi"
              value={`${stats.data?.dispute_rate ?? '0.0'}%`}
              icon={Scale}
              tone="info"
              caption={{
                text: `o'rtacha ${stats.data?.average_hours ?? '0.0'} soat · xaridor foydasiga ${
                  stats.data?.buyer_favoured_percent ?? '0.0'
                }%`,
                tone: 'muted',
              }}
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
              className="w-56"
            />
            <Select
              aria-label="Sabab bo'yicha filtr"
              options={reasonOptions}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setPage(1);
              }}
              className="w-60"
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
              isLoading={isLoading || (isFetching && !data)}
              skeletonRows={perPage > 20 ? 20 : perPage}
              density="compact"
              emptyMessage="Bunday shikoyat topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta shikoyat` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
