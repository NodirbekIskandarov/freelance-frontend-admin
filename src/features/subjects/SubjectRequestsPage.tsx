import { ArrowLeft, Calendar, Check, CircleX, Clock, Eye, FileText, Filter, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { SubjectRequest, SubjectRequestsListQuery } from '@/shared/types/subjects';

import { useGetSubjectRequestsQuery } from './subjectsApi';

const tabs: TabItem[] = [
  { id: 'all', label: 'Barcha arizalar', icon: FileText },
  { id: 'pending', label: 'Kutilayotgan arizalar', icon: Clock },
  { id: 'rejected', label: 'Rad etilgan arizalar', icon: CircleX },
];

const statusOptions = [
  { value: 'all', label: 'Barcha statuslar' },
  { value: 'Kutilmoqda', label: 'Kutilmoqda' },
  { value: 'Tasdiqlashda', label: 'Tasdiqlashda' },
  { value: 'Tasdiqlangan', label: 'Tasdiqlangan' },
  { value: 'Rad etilgan', label: 'Rad etilgan' },
];

export function SubjectRequestsPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<NonNullable<SubjectRequestsListQuery['tab']>>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [institute, setInstitute] = useState('all');
  const [status, setStatus] = useState('all');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetSubjectRequestsQuery({
    tab,
    page,
    limit: perPage,
    search: debouncedSearch || undefined,
    institute: institute === 'all' ? undefined : institute,
    status: status === 'all' ? undefined : status,
  });

  const resetToFirstPage = () => setPage(1);

  const columns: Column<SubjectRequest>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      header: 'Fan nomi',
      className: 'max-w-[170px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block text-fg">{row.name}</span>
          <span className="block text-xs text-fg-muted">{row.code}</span>
        </span>
      ),
    },
    {
      key: 'institute',
      header: 'Institut',
      className: 'max-w-[190px]',
      cell: (row) => (
        <span className="flex items-start gap-2.5">
          <Avatar name={row.institute.short} src={row.institute.logoUrl} size="sm" />
          <span className="min-w-0 leading-snug">
            {row.institute.name} <span className="text-primary">({row.institute.short})</span>
          </span>
        </span>
      ),
    },
    {
      key: 'summary',
      header: "Qisqacha ma'lumot",
      className: 'max-w-[230px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block text-fg-muted">{row.summary}</span>
          <span className="mt-1 block text-xs text-fg-dim">Kurs: {row.course}</span>
        </span>
      ),
    },
    {
      key: 'requester',
      header: 'Ariza beruvchi',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={row.requester.name} src={row.requester.avatarUrl} size="sm" />
          <span className="min-w-0 leading-snug">
            <span className="block whitespace-nowrap text-fg">{row.requester.name}</span>
            <span
              className={
                row.requester.role === 'Freelancer'
                  ? 'block text-xs text-info'
                  : 'block text-xs text-fg-muted'
              }
            >
              {row.requester.role}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Ariza sanasi',
      cell: (row) => (
        <span className="block leading-snug whitespace-nowrap">
          <span className="block text-fg-soft">{row.date}</span>
          <span className="block text-xs text-fg-muted">{row.time}</span>
        </span>
      ),
    },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <IconButton label={`${row.code} — ko'rish`} size="sm">
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>

          {/* Tasdiqlangan arizada boshqa qaror qabul qilinmaydi. */}
          {row.status !== 'Tasdiqlangan' && (
            <>
              <IconButton label={`${row.code} — tasdiqlash`} tone="success" size="sm">
                <Check className="size-4" strokeWidth={2} />
              </IconButton>
              <IconButton label={`${row.code} — rad etish`} tone="danger" size="sm">
                <X className="size-4" strokeWidth={2} />
              </IconButton>
            </>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Fan qo‘shish arizalari"
        breadcrumbs={[
          { label: 'Bosh sahifa', to: '/' },
          { label: 'Fanlar', to: '/fanlar' },
          { label: "Fan qo'shish arizalari" },
        ]}
        actions={
          <Button
            variant="secondary"
            icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
            onClick={() => navigate('/fanlar')}
          >
            Fanlar ro‘yxatiga qaytish
          </Button>
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Tabs
            items={tabs}
            active={tab}
            onChange={(id) => {
              setTab(id as NonNullable<SubjectRequestsListQuery['tab']>);
              resetToFirstPage();
            }}
            className="px-2"
          />

          <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <SearchInput
              placeholder="Fan nomi, institut yoki foydalanuvchi..."
              iconPosition="right"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetToFirstPage();
              }}
              className="min-w-[240px] flex-1"
            />
            <Select
              aria-label="Institut bo'yicha filtr"
              options={[
                { value: 'all', label: 'Barcha institutlar' },
                ...(data?.institutes ?? []).map((item) => ({ value: item, label: item })),
              ]}
              value={institute}
              onChange={(event) => {
                setInstitute(event.target.value);
                resetToFirstPage();
              }}
              className="w-48"
            />
            <Select
              aria-label="Status bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                resetToFirstPage();
              }}
              className="w-44"
            />
            <Select
              aria-label="Sana oralig'i"
              options={[{ value: 'all', label: "Sana oralig'i" }]}
              icon={<Calendar className="size-4" strokeWidth={1.75} />}
              className="w-44"
            />
            <Button variant="secondary" icon={<Filter className="size-4" strokeWidth={1.75} />}>
              Filter
            </Button>
          </div>

          <Table
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(row) => row.id}
            isLoading={isLoading || isFetching}
            skeletonRows={perPage}
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
            perPageOptions={[10, 20, 50]}
            summary={data ? `Jami ${formatSom(data.pagination.total)} ta ariza` : undefined}
          />
        </Card>
      )}
    </>
  );
}
