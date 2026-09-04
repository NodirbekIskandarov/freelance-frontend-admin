import { Lock, LockOpen, PencilLine, Plus, Receipt, Snowflake } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatDecimalSom, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminWallet } from '@/shared/types/adminWallet';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { RowActions } from '@/components/ui/RowActions';

import { AdjustWalletModal } from './AdjustWalletModal';
import { TopupWalletModal } from './TopupWalletModal';
import { WalletTransactionsModal } from './WalletTransactionsModal';
import { useFreezeWalletMutation, useGetWalletsQuery } from './adminWalletApi';

const frozenOptions = [
  { value: 'all', label: 'Barcha hamyonlar' },
  { value: 'false', label: 'Faol' },
  { value: 'true', label: 'Muzlatilgan' },
];

export function WalletsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [frozen, setFrozen] = useState('all');
  const [search, setSearch] = useState('');
  const [adjustTarget, setAdjustTarget] = useState<AdminWallet | null>(null);
  const [topupTarget, setTopupTarget] = useState<AdminWallet | null>(null);
  const [freezeTarget, setFreezeTarget] = useState<AdminWallet | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminWallet | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetWalletsQuery({
    page,
    page_size: perPage,
    ordering: '-balance',
    ...(frozen !== 'all' ? { is_frozen: frozen === 'true' } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [freeze, freezeState] = useFreezeWalletMutation();

  const columns: Column<AdminWallet>[] = [
    {
      key: 'user',
      header: 'Egasi',
      cell: (row) => (
        <span className="block whitespace-nowrap">
          <span className="block font-medium text-fg">{row.user.full_name || '—'}</span>
          <span className="block text-xs text-fg-muted">{row.user.phone}</span>
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      className: 'max-w-[220px]',
      cell: (row) => (
        <span className="block truncate text-fg-soft" title={row.user.email}>
          {row.user.email || '—'}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balans',
      align: 'right',
      cell: (row) => (
        <span className="font-medium whitespace-nowrap text-fg tabular-nums">
          {formatDecimalSom(row.balance)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <Badge tone={row.is_frozen ? 'danger' : 'success'}>
          {row.is_frozen ? 'Muzlatilgan' : 'Faol'}
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
          actions={[
            {
              label: 'Tranzaksiyalar',
              icon: <Receipt className="size-4" strokeWidth={1.75} />,
              onSelect: () => setHistoryTarget(row),
            },
            {
              label: "Balansni to'ldirish",
              icon: <Plus className="size-4" strokeWidth={2} />,
              onSelect: () => setTopupTarget(row),
            },
            {
              label: 'Balansni tuzatish',
              icon: <PencilLine className="size-4" strokeWidth={1.75} />,
              onSelect: () => setAdjustTarget(row),
            },
            /*
                Muzlatish ilgari bir bosishda bajarilardi — tasdiqsiz,
                zararsiz amallar yonida. Endi u `⋯` ichida va kimga
                tegishini aytadigan oyna ochadi.
              */
            {
              label: row.is_frozen ? 'Muzlatishni bekor qilish' : 'Muzlatish',
              icon: row.is_frozen ? (
                <LockOpen className="size-4" strokeWidth={1.75} />
              ) : (
                <Lock className="size-4" strokeWidth={1.75} />
              ),
              destructive: !row.is_frozen,
              disabled: freezeState.isLoading,
              onSelect: () => setFreezeTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  const frozenCount = data?.results.filter((row) => row.is_frozen).length ?? 0;

  return (
    <>
      <PageHeader
        title="Hamyonlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Hamyonlar' }]}
      />

      {error ? (
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      ) : (
        <>
          {freezeState.error !== undefined && freezeState.error !== null && (
            <div className="mb-4 rounded-card border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
              {getApiErrorMessage(freezeState.error)}
            </div>
          )}

          <section className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Holat bo'yicha filtr"
              options={frozenOptions}
              value={frozen}
              onChange={(event) => {
                setFrozen(event.target.value);
                setPage(1);
              }}
              className="w-52"
            />

            {/* Sahifadagi muzlatilganlar soni — backend statistika bermaydi,
                shuning uchun bu faqat ko'rinib turgan qatorlar bo'yicha. */}
            {frozenCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
                <Snowflake className="size-4" strokeWidth={1.75} />
                Bu sahifada {frozenCount} ta muzlatilgan
              </span>
            )}

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
              emptyMessage="Bunday hamyon topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta hamyon` : undefined}
            />
          </Card>
        </>
      )}

      <ConfirmDialog
        open={freezeTarget !== null}
        title={freezeTarget?.is_frozen ? 'Muzlatishni bekor qilish' : 'Hamyonni muzlatish'}
        description={
          freezeTarget?.is_frozen
            ? `${freezeTarget.user.full_name || freezeTarget.user.phone} hamyonida pul yana harakatlana boshlaydi.`
            : `${freezeTarget?.user.full_name || freezeTarget?.user.phone} hamyonida pul harakati to'xtaydi: xarid ham, sotuv ham, pul yechish ham. Tarix saqlanadi.`
        }
        confirmLabel={freezeTarget?.is_frozen ? 'Bekor qilish' : 'Muzlatish'}
        isLoading={freezeState.isLoading}
        error={freezeState.error}
        onConfirm={() => {
          if (!freezeTarget) return;
          void freeze({ id: freezeTarget.id, frozen: !freezeTarget.is_frozen })
            .unwrap()
            .then(() => setFreezeTarget(null))
            .catch(() => undefined);
        }}
        onClose={() => setFreezeTarget(null)}
      />

      <TopupWalletModal wallet={topupTarget} onClose={() => setTopupTarget(null)} />
      <AdjustWalletModal wallet={adjustTarget} onClose={() => setAdjustTarget(null)} />
      <WalletTransactionsModal wallet={historyTarget} onClose={() => setHistoryTarget(null)} />
    </>
  );
}
