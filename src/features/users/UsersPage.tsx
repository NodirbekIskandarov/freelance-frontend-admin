import {
  CircleX,
  Download,
  Eye,
  Filter,
  Lock,
  Pencil,
  Plus,
  UserPlus,
  Users,
  UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column, type SortState } from '@/components/ui/Table';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminUser, UserStatus } from '@/shared/types/users';

import { useGetUsersQuery } from './usersApi';

/** 125000 → "125 000". Dizaynda ming ajratgichi — probel. */
function formatSom(value: number): string {
  return value.toLocaleString('ru-RU').replace(/ /g, ' ');
}

const statusOptions = [
  { value: 'all', label: 'Barcha statuslar' },
  { value: 'Faol', label: 'Faol' },
  { value: 'Kutilmoqda', label: 'Kutilmoqda' },
  { value: 'Bloklangan', label: 'Bloklangan' },
];

const dateOptions = [{ value: 'all', label: "Ro'yxatdan o'tgan sana" }];
const balanceOptions = [{ value: 'all', label: "Balans oralig'i" }];

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState<UserStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | undefined>();

  // Har harf uchun so'rov yubormaslik kerak — foydalanuvchi yozib
  // bo'lgandan keyin bitta so'rov ketadi.
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetUsersQuery({
    page,
    limit: perPage,
    status,
    search: debouncedSearch || undefined,
    sortBy: sort?.key,
    sortOrder: sort?.direction,
  });

  const handleSort = (key: string) => {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' },
    );
    setPage(1);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'displayId',
      header: 'User ID',
      cell: (row) => <span className="whitespace-nowrap text-fg-soft">{row.displayId}</span>,
    },
    {
      key: 'name',
      header: 'Ism familiya',
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <span className="whitespace-nowrap text-fg">{row.name}</span>
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefon',
      cell: (row) => <span className="whitespace-nowrap">{row.phone}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      // Uzun email butun jadvalni kengaytirib yubormasligi kerak.
      className: 'max-w-[220px] truncate',
      cell: (row) => (
        <span className="block truncate" title={row.email}>
          {row.email}
        </span>
      ),
    },
    {
      key: 'registeredAt',
      header: "Ro'yxatdan o'tgan sana",
      sortable: true,
      cell: (row) => <span className="whitespace-nowrap">{row.registeredAt}</span>,
    },
    {
      key: 'balance',
      header: "Balans (so'm)",
      cell: (row) => <span className="whitespace-nowrap">{formatSom(row.balance)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-2">
          <IconButton label={`${row.name} — ko'rish`} tone="success" size="sm">
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.name} — tahrirlash`} tone="warning" size="sm">
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.name} — bloklash`} tone="danger" size="sm">
            <Lock className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  const stats = data?.stats;

  return (
    <>
      <PageHeader
        title="Foydalanuvchilar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Foydalanuvchilar' }]}
        actions={
          <>
            <Button variant="secondary" icon={<Download className="size-4" strokeWidth={1.75} />}>
              Export (Excel)
            </Button>
            <Button icon={<Plus className="size-4" strokeWidth={2} />}>Yangi foydalanuvchi</Button>
          </>
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami foydalanuvchilar"
              value={stats ? formatSom(stats.total) : '—'}
              icon={Users}
              tone="success"
              trend={
                stats
                  ? { direction: 'up', value: String(stats.totalDeltaThisMonth), note: 'bu oy' }
                  : undefined
              }
            />
            <StatCard
              label="Bugun qo‘shilganlar"
              value={stats ? String(stats.addedToday) : '—'}
              icon={UserPlus}
              tone="info"
              trend={
                stats
                  ? { direction: 'up', value: String(stats.addedTodayDelta), note: 'bugun' }
                  : undefined
              }
            />
            <StatCard
              label="Faol foydalanuvchilar"
              value={stats ? formatSom(stats.active) : '—'}
              icon={UserRoundCheck}
              tone="purple"
              caption={stats ? { text: stats.activePercent, tone: 'success' } : undefined}
            />
            <StatCard
              label="Bloklangan foydalanuvchilar"
              value={stats ? formatSom(stats.blocked) : '—'}
              icon={CircleX}
              tone="danger"
              caption={stats ? { text: stats.blockedPercent, tone: 'danger' } : undefined}
            />
          </section>

          <section className="mt-4 flex flex-wrap items-center gap-3">
            <Select
              aria-label="Status bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as UserStatus | 'all');
                setPage(1);
              }}
              className="w-48"
            />
            <Select aria-label="Sana bo'yicha filtr" options={dateOptions} className="w-56" />
            <Select aria-label="Balans bo'yicha filtr" options={balanceOptions} className="w-48" />

            <div className="ml-auto flex items-center gap-3">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-72"
              />
              <Button variant="secondary" icon={<Filter className="size-4" strokeWidth={1.75} />}>
                Filtr
              </Button>
            </div>
          </section>

          <Card className="mt-4 overflow-hidden">
            <Table
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              isLoading={isLoading || isFetching}
              skeletonRows={perPage > 20 ? 20 : perPage}
              sort={sort}
              onSortChange={handleSort}
              emptyMessage="Bunday foydalanuvchi topilmadi"
            />

            <Pagination
              page={page}
              totalPages={data?.pagination.totalPages ?? 1}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              summary={
                data ? `Jami ${formatSom(data.pagination.total)} ta foydalanuvchi` : undefined
              }
            />
          </Card>
        </>
      )}
    </>
  );
}
