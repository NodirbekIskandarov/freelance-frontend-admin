import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DateCell } from '@/components/ui/Cells';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { PersonCell } from '@/components/ui/PersonCell';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { cn } from '@/lib/cn';
import { formatDecimalSom, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import {
  absoluteAmount,
  isCreditTransaction,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPES,
  type LedgerEntry,
  type TransactionType,
} from '@/shared/types/adminWallet';

import { useGetLedgerQuery, useGetLedgerTotalsQuery } from './adminWalletApi';

const typeOptions = [
  { value: 'all', label: 'Barcha turlar' },
  ...TRANSACTION_TYPES.map((value) => ({ value, label: TRANSACTION_TYPE_LABELS[value] })),
];

/**
 * Pul harakati — butun platforma bo'yicha.
 *
 * Hamyon ichidagi ko'chirma «bu odamga nima bo'ldi» degan savolga javob
 * beradi. Bu ekran boshqasiga: «bugun nima bo'ldi» — pul o'tishi kerak edi,
 * o'tdimi yo'qmi. Buni bilish uchun hamyonlarni birma-bir ochib chiqishga
 * to'g'ri kelardi.
 */
export function LedgerPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 350);

  const filters = {
    ...(type !== 'all' ? { type: type as TransactionType } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { data, isLoading, isFetching, error } = useGetLedgerQuery({
    page,
    page_size: perPage,
    ...filters,
  });

  // Yig'indilar AYNAN shu filtr bo'yicha: ekranda ko'rinib turgan
  // ro'yxatning yig'indisi boshqa raqam bo'lsa, ikkalasiga ham ishonib
  // bo'lmasdi.
  const totals = useGetLedgerTotalsQuery(filters);

  const columns: Column<LedgerEntry>[] = [
    {
      key: 'created_at',
      header: 'Vaqt',
      cell: (row) => <DateCell value={row.created_at} />,
    },
    {
      key: 'user',
      header: 'Kimning hamyoni',
      className: 'max-w-[200px]',
      cell: (row) => <PersonCell name={row.user?.full_name} phone={row.user?.phone} />,
    },
    {
      key: 'type',
      header: 'Turi',
      cell: (row) => <Badge tone="neutral">{TRANSACTION_TYPE_LABELS[row.type] ?? row.type}</Badge>,
    },
    {
      key: 'description',
      header: 'Izoh',
      className: 'max-w-[280px]',
      cell: (row) => (
        <span className="block truncate text-fg-soft" title={row.description}>
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Summa',
      align: 'right',
      /*
        Ishora TURDAN emas, summaning o'zidan olinadi: `adjustment` ikkala
        tomonga ham ishlaydi va musbat tuzatish qizil minus bo'lib
        ko'rinardi.
      */
      cell: (row) => {
        const credit = isCreditTransaction(row.amount);
        return (
          <span
            className={cn(
              'font-medium whitespace-nowrap tabular-nums',
              credit ? 'text-success' : 'text-danger',
            )}
          >
            {credit ? '+' : '−'}
            {formatDecimalSom(absoluteAmount(row.amount))}
          </span>
        );
      },
    },
    {
      key: 'balance_after',
      header: 'Keyin',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted tabular-nums">
          {formatDecimalSom(row.balance_after)}
        </span>
      ),
    },
    {
      key: 'created_by',
      header: 'Kim yozgan',
      className: 'max-w-[180px]',
      /* Bo'sh — avtomatik yozuv (xarid, sotuv). To'lgan — buni qo'lda
         qilgan xodim: to'ldirish va tuzatish faqat shunday paydo bo'ladi. */
      cell: (row) =>
        row.created_by ? (
          <PersonCell name={row.created_by.full_name} phone={row.created_by.phone} />
        ) : (
          <span className="text-fg-dim">Avtomatik</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pul harakati"
        subtitle="Platforma bo'yicha barcha hamyon yozuvlari"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Pul harakati' }]}
      />

      {error ? (
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      ) : (
        <>
          {/* Kirim va chiqim ALOHIDA: bir million kirib, bir million
              chiqqan kun — hech nima bo'lmagan kun emas, sof raqam esa
              ikkalasini ajrata olmaydi. */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Yozuvlar"
              value={formatSom(totals.data?.count ?? 0)}
              icon={Scale}
              tone="info"
            />
            <StatCard
              label="Kirim"
              value={formatDecimalSom(totals.data?.credit ?? '0')}
              icon={ArrowDownLeft}
              tone="success"
            />
            <StatCard
              label="Chiqim"
              value={formatDecimalSom(totals.data?.debit ?? '0')}
              icon={ArrowUpRight}
              tone="danger"
            />
            <StatCard
              label="Sof"
              value={formatDecimalSom(totals.data?.net ?? '0')}
              icon={Scale}
              tone="primary"
            />
          </section>

          <section className="mt-4 flex flex-wrap items-center gap-3">
            <Select
              aria-label="Tur bo'yicha filtr"
              options={typeOptions}
              value={type}
              onChange={(event) => {
                setType(event.target.value);
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
              isLoading={isLoading || (isFetching && !data)}
              skeletonRows={perPage > 20 ? 20 : perPage}
              density="compact"
              emptyMessage="Bunday yozuv topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta yozuv` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
