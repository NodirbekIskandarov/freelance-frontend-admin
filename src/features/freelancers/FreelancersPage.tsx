import {
  Ban,
  ChevronDown,
  CircleX,
  Download,
  Eye,
  Filter,
  Lock,
  Pause,
  Plus,
  Star,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DocumentThumb } from '@/components/ui/DocumentThumb';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { Table, type Column, type SortState } from '@/components/ui/Table';
import { getApiErrorMessage } from '@/shared/api';
import type { Freelancer, FreelancerStatus } from '@/shared/types/freelancers';

import { useGetFreelancersQuery } from './freelancersApi';

const statusOptions = [
  { value: 'all', label: 'Barcha statuslar' },
  { value: 'Faol', label: 'Faol' },
  { value: 'Vaqtinchalik bloklangan', label: 'Vaqtinchalik bloklangan' },
  { value: 'Bloklangan', label: 'Bloklangan' },
];

const sortOptions = [
  { value: 'rating', label: "Reyting bo'yicha" },
  { value: 'completedJobs', label: "Bajarilgan ishlar bo'yicha" },
  { value: 'income', label: "Daromad bo'yicha" },
];

function RatingCell({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="block whitespace-nowrap">
      <span className="flex items-center gap-1.5 text-fg">
        <Star className="size-4 fill-warning text-warning" strokeWidth={0} />
        {rating.toFixed(1)}
      </span>
      <span className="mt-0.5 block text-xs text-fg-muted">({count} ta baho)</span>
    </span>
  );
}

export function FreelancersPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState<FreelancerStatus | 'all'>('all');
  const [speciality, setSpeciality] = useState('all');
  const [institute, setInstitute] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | undefined>();

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetFreelancersQuery({
    page,
    limit: perPage,
    status,
    speciality: speciality === 'all' ? undefined : speciality,
    institute: institute === 'all' ? undefined : institute,
    search: debouncedSearch || undefined,
    sortBy: sort?.key,
    sortOrder: sort?.direction,
  });

  const resetToFirstPage = () => setPage(1);

  const handleSort = (key: string) => {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' },
    );
    resetToFirstPage();
  };

  const columns: Column<Freelancer>[] = [
    {
      key: 'displayId',
      header: 'Freelancer ID',
      cell: (row) => <span className="whitespace-nowrap">{row.displayId}</span>,
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
      key: 'speciality',
      header: 'Mutaxassislik',
      className: 'max-w-[140px]',
      cell: (row) => <span className="block">{row.speciality}</span>,
    },
    { key: 'institute', header: 'Institut', cell: (row) => row.institute },
    {
      key: 'document',
      header: 'Pasport/ID rasmi',
      cell: (row) => <DocumentThumb src={row.documentUrl} alt={`${row.name} hujjati`} />,
    },
    {
      key: 'rating',
      header: 'Reyting',
      sortable: true,
      cell: (row) => <RatingCell rating={row.rating} count={row.ratingCount} />,
    },
    {
      key: 'completedJobs',
      header: 'Bajarilgan ishlar',
      sortable: true,
      cell: (row) => row.completedJobs,
    },
    {
      key: 'income',
      header: "Daromad (so'm)",
      sortable: true,
      cell: (row) => <span className="whitespace-nowrap">{formatSom(row.income)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      // "Vaqtinchalik bloklangan" bitta qatorda ~150px egallaydi va jadvalni
      // konteynerdan chiqarib yuboradi. Dizaynda ham u ikki qatorga bo'linadi.
      className: 'w-[112px]',
      cell: (row) => <StatusBadge status={row.status} className="text-center whitespace-normal" />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <IconButton label={`${row.name} — ko'rish`} tone="success" size="sm">
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.name} — bloklash`} tone="danger" size="sm">
            <Lock className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.name} — vaqtincha to'xtatish`} tone="warning" size="sm">
            <Ban className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  const stats = data?.stats;

  return (
    <>
      <PageHeader
        title="Freelancerlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Freelancerlar' }]}
        actions={
          <>
            <Button
              icon={<Plus className="size-4" strokeWidth={2} />}
              trailing={<ChevronDown className="size-4" strokeWidth={2} />}
            >
              Yeni freelancer qo‘shish
            </Button>
            <Button variant="secondary" icon={<Download className="size-4" strokeWidth={1.75} />}>
              Export (Excel)
            </Button>
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
              label="Jami freelancerlar"
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
              label="Faol freelancerlar"
              value={stats ? formatSom(stats.active) : '—'}
              icon={Star}
              tone="info"
              caption={stats ? { text: stats.activePercent, tone: 'success' } : undefined}
            />
            <StatCard
              label="Vaqtinchalik bloklanganlar"
              value={stats ? String(stats.temporarilyBlocked) : '—'}
              icon={Pause}
              tone="orange"
              caption={stats ? { text: stats.temporarilyBlockedPercent, tone: 'muted' } : undefined}
            />
            <StatCard
              label="Bloklanganlar"
              value={stats ? String(stats.blocked) : '—'}
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
                setStatus(event.target.value as FreelancerStatus | 'all');
                resetToFirstPage();
              }}
              className="w-40"
            />
            <Select
              aria-label="Mutaxassislik bo'yicha filtr"
              options={[
                { value: 'all', label: 'Barcha mutaxassisliklar' },
                ...(data?.filters.specialities ?? []).map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
              value={speciality}
              onChange={(event) => {
                setSpeciality(event.target.value);
                resetToFirstPage();
              }}
              className="w-52"
            />
            <Select
              aria-label="Universitet bo'yicha filtr"
              options={[
                { value: 'all', label: 'Barcha universitetlar' },
                ...(data?.filters.institutes ?? []).map((item) => ({ value: item, label: item })),
              ]}
              value={institute}
              onChange={(event) => {
                setInstitute(event.target.value);
                resetToFirstPage();
              }}
              className="w-48"
            />
            <Select
              aria-label="Saralash"
              options={sortOptions}
              value={sort?.key ?? 'rating'}
              onChange={(event) => handleSort(event.target.value)}
              className="w-48"
            />

            <div className="ml-auto flex items-center gap-3">
              <SearchInput
                iconPosition="right"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetToFirstPage();
                }}
                className="w-60"
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
              skeletonRows={Math.min(perPage, 10)}
              density="compact"
              sort={sort}
              onSortChange={handleSort}
              emptyMessage="Bunday freelancer topilmadi"
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
              summary={data ? `Jami ${formatSom(data.pagination.total)} ta freelancer` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
