import {
  Calendar,
  Check,
  CircleCheck,
  CircleX,
  Clock,
  Download,
  Eye,
  Filter,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileChip, FolderCount } from '@/components/ui/FileChip';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { ApplicationStatus, FreelancerApplication } from '@/shared/types/applications';

import { useGetFreelancerApplicationsQuery } from './applicationsApi';

const statusOptions = [
  { value: 'all', label: 'Barcha statuslar' },
  { value: 'Kutilmoqda', label: 'Kutilmoqda' },
  { value: 'Tasdiqlangan', label: 'Tasdiqlangan' },
  { value: 'Rad etilgan', label: 'Rad etilgan' },
];

export function ApplicationsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all');
  const [university, setUniversity] = useState('all');
  const [speciality, setSpeciality] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetFreelancerApplicationsQuery({
    page,
    limit: perPage,
    status,
    university: university === 'all' ? undefined : university,
    speciality: speciality === 'all' ? undefined : speciality,
    search: debouncedSearch || undefined,
  });

  const resetToFirstPage = () => setPage(1);

  const columns: Column<FreelancerApplication>[] = [
    {
      key: 'displayId',
      header: 'Ariza ID',
      cell: (row) => <span className="whitespace-nowrap">{row.displayId}</span>,
    },
    {
      key: 'user',
      header: 'User',
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.userName} src={row.userAvatarUrl} size="sm" />
          <span className="whitespace-nowrap text-fg">{row.userName}</span>
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefon',
      cell: (row) => <span className="whitespace-nowrap">{row.phone}</span>,
    },
    { key: 'university', header: 'Universitet', cell: (row) => row.university },
    {
      key: 'speciality',
      header: 'Mutaxassislik',
      className: 'max-w-[150px]',
      cell: (row) => <span className="block">{row.speciality}</span>,
    },
    {
      key: 'document',
      header: 'Pasport/ID karta fayli',
      cell: (row) => <FileChip file={row.document} />,
    },
    {
      key: 'portfolio',
      header: 'Portfolio',
      cell: (row) => <FolderCount count={row.portfolioCount} />,
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
        <span className="flex items-center gap-1.5">
          <IconButton
            label={`${row.displayId} — ko'rish`}
            tone="info"
            size="sm"
            onClick={() => navigate(`/freelancer-arizalari/${row.id}`)}
          >
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>

          {/*
            Tasdiqlash va rad etish faqat hal qilinmagan arizada ko'rinadi —
            dizaynda ham hal bo'lgan qatorlarda faqat "ko'rish" turadi.
          */}
          {row.status === 'Kutilmoqda' && (
            <>
              <IconButton label={`${row.displayId} — tasdiqlash`} tone="success" size="sm">
                <Check className="size-4" strokeWidth={2} />
              </IconButton>
              <IconButton label={`${row.displayId} — rad etish`} tone="danger" size="sm">
                <X className="size-4" strokeWidth={2} />
              </IconButton>
            </>
          )}
        </span>
      ),
    },
  ];

  const stats = data?.stats;

  return (
    <>
      <PageHeader
        title="Freelancer arizalari"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Freelancer arizalari' }]}
        actions={
          <>
            <Select
              aria-label="Status bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ApplicationStatus | 'all');
                resetToFirstPage();
              }}
              icon={<Filter className="size-4" strokeWidth={1.75} />}
              className="w-52"
            />
            <Button icon={<Download className="size-4" strokeWidth={1.75} />}>
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
              label="Jami arizalar"
              value={stats ? formatSom(stats.total) : '—'}
              icon={Users}
              tone="info"
              caption={stats ? { text: stats.totalPercent, tone: 'muted' } : undefined}
            />
            <StatCard
              label="Kutilmoqda"
              value={stats ? String(stats.pending) : '—'}
              icon={Clock}
              tone="warning"
              caption={stats ? { text: stats.pendingPercent, tone: 'muted' } : undefined}
            />
            <StatCard
              label="Tasdiqlangan"
              value={stats ? String(stats.approved) : '—'}
              icon={CircleCheck}
              tone="success"
              caption={stats ? { text: stats.approvedPercent, tone: 'muted' } : undefined}
            />
            <StatCard
              label="Rad etilgan"
              value={stats ? String(stats.rejected) : '—'}
              icon={CircleX}
              tone="danger"
              caption={stats ? { text: stats.rejectedPercent, tone: 'muted' } : undefined}
            />
          </section>

          <section className="mt-4 flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Qidirish (ism, telefon, universitet...)"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetToFirstPage();
              }}
              className="min-w-[280px] flex-1"
            />
            <Select
              aria-label="Universitet bo'yicha filtr"
              options={[
                { value: 'all', label: 'Barcha universitetlar' },
                ...(data?.filters.universities ?? []).map((item) => ({
                  value: item,
                  label: item,
                })),
              ]}
              value={university}
              onChange={(event) => {
                setUniversity(event.target.value);
                resetToFirstPage();
              }}
              className="w-52"
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
              className="w-56"
            />
            <Select
              aria-label="Sana oralig'i"
              options={[{ value: 'all', label: "Sana oralig'i" }]}
              icon={<Calendar className="size-4" strokeWidth={1.75} />}
              className="w-48"
            />
          </section>

          <Card className="mt-4 overflow-hidden">
            <Table
              columns={columns}
              rows={data?.items ?? []}
              rowKey={(row) => row.id}
              isLoading={isLoading || isFetching}
              skeletonRows={Math.min(perPage, 10)}
              density="compact"
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
              summary={data ? `Jami ${formatSom(data.pagination.total)} ta ariza` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
