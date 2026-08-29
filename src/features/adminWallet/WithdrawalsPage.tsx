import { BanknoteArrowDown, CircleCheck, CircleX, Clock, Wallet } from 'lucide-react';
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
  WITHDRAWAL_METHOD_LABELS,
  WITHDRAWAL_METHODS,
  WITHDRAWAL_STATUS_LABELS,
  WITHDRAWAL_STATUSES,
  type AdminWithdrawal,
  type WithdrawalMethod,
  type WithdrawalStatus,
} from '@/shared/types/adminWallet';

import { WithdrawalNoteModal } from './WithdrawalNoteModal';
import { useGetWithdrawalsQuery, useGetWithdrawalStatsQuery } from './adminWalletApi';

const statusTones: Record<WithdrawalStatus, BadgeTone> = {
  pending: 'warning',
  paid: 'success',
  rejected: 'danger',
};

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  ...WITHDRAWAL_STATUSES.map((value) => ({ value, label: WITHDRAWAL_STATUS_LABELS[value] })),
];

const methodOptions = [
  { value: 'all', label: 'Barcha usullar' },
  ...WITHDRAWAL_METHODS.map((value) => ({ value, label: WITHDRAWAL_METHOD_LABELS[value] })),
];

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU').slice(0, 16);
}

export function WithdrawalsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState('pending');
  const [method, setMethod] = useState('all');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<{ row: AdminWithdrawal; kind: 'pay' | 'reject' } | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: stats } = useGetWithdrawalStatsQuery();
  const { data, isLoading, isFetching, error } = useGetWithdrawalsQuery({
    page,
    page_size: perPage,
    ordering: '-created_at',
    ...(status !== 'all' ? { status: status as WithdrawalStatus } : {}),
    ...(method !== 'all' ? { method: method as WithdrawalMethod } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const columns: Column<AdminWithdrawal>[] = [
    {
      key: 'user',
      header: 'Foydalanuvchi',
      cell: (row) => (
        <span className="block whitespace-nowrap">
          <span className="block font-medium text-fg">{row.user.full_name || '—'}</span>
          <span className="block text-xs text-fg-muted">{row.user.phone}</span>
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Summa',
      align: 'right',
      cell: (row) => (
        <span className="block text-right whitespace-nowrap">
          <span className="block font-medium text-fg tabular-nums">
            {formatDecimalSom(row.amount)}
          </span>
          {/* Hozirgi balans — to'lashdan oldin yetarlimi, ko'rinib tursin. */}
          <span className="block text-xs text-fg-muted">
            balans: {formatDecimalSom(row.balance)}
          </span>
        </span>
      ),
    },
    {
      key: 'destination',
      header: 'Qayerga',
      cell: (row) => (
        <span className="block whitespace-nowrap">
          <span className="block font-mono text-sm text-fg">{row.destination}</span>
          <span className="block text-xs text-fg-muted">
            {WITHDRAWAL_METHOD_LABELS[row.method]}
            {row.destination_name ? ` · ${row.destination_name}` : ''}
          </span>
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Raqam',
      cell: (row) => <span className="font-mono text-xs text-fg-muted">{row.reference}</span>,
    },
    {
      key: 'created_at',
      header: 'Sana',
      cell: (row) => (
        <span className="block whitespace-nowrap">
          <span className="block text-fg-muted">{formatDate(row.created_at)}</span>
          {row.processed_at && (
            <span className="block text-xs text-fg-muted">
              yakun: {formatDate(row.processed_at)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <span className="flex flex-col items-start gap-1">
          <Badge tone={statusTones[row.status]}>{WITHDRAWAL_STATUS_LABELS[row.status]}</Badge>
          {row.admin_note && (
            <span className="max-w-[180px] truncate text-xs text-fg-muted" title={row.admin_note}>
              {row.admin_note}
            </span>
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
      cell: (row) =>
        // Yakunlangan so'rovga qayta tegib bo'lmaydi.
        row.status === 'pending' ? (
          <span className="flex items-center justify-end gap-2">
            <IconButton
              label="To'landi deb belgilash"
              tone="success"
              size="sm"
              onClick={() => setAction({ row, kind: 'pay' })}
            >
              <CircleCheck className="size-4" strokeWidth={1.75} />
            </IconButton>
            <IconButton
              label="Rad etish"
              tone="danger"
              size="sm"
              onClick={() => setAction({ row, kind: 'reject' })}
            >
              <CircleX className="size-4" strokeWidth={1.75} />
            </IconButton>
          </span>
        ) : (
          <span className="text-xs text-fg-muted">{row.processed_by?.full_name ?? '—'}</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pul yechish so'rovlari"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: "Pul yechish so'rovlari" }]}
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami so'rov"
              value={stats ? formatSom(stats.total) : '—'}
              icon={BanknoteArrowDown}
              tone="info"
            />
            <StatCard
              label="Kutilmoqda"
              value={stats ? formatSom(stats.pending) : '—'}
              icon={Clock}
              tone="warning"
              caption={
                stats ? { text: formatDecimalSom(stats.pending_amount), tone: 'muted' } : undefined
              }
            />
            <StatCard
              label="To'langan"
              value={stats ? formatSom(stats.paid) : '—'}
              icon={Wallet}
              tone="success"
              caption={
                stats ? { text: formatDecimalSom(stats.paid_amount), tone: 'success' } : undefined
              }
            />
            <StatCard
              label="Rad etilgan"
              value={stats ? formatSom(stats.rejected) : '—'}
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
            <Select
              aria-label="Usul bo'yicha filtr"
              options={methodOptions}
              value={method}
              onChange={(event) => {
                setMethod(event.target.value);
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
              emptyMessage="Bunday so'rov topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta so'rov` : undefined}
            />
          </Card>
        </>
      )}

      <WithdrawalNoteModal action={action} onClose={() => setAction(null)} />
    </>
  );
}
