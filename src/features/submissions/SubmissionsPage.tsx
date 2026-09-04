import { ArrowLeft, ChevronRight, CircleCheck, CircleX, Clock } from 'lucide-react';
import { useState } from 'react';
import { useLocaleNavigate } from '@/i18n/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { assignmentTypeLabel } from '@/shared/types/assignments';
import {
  SOLUTION_STATUS_LABELS,
  SOLUTION_STATUSES,
  type SolutionStatus,
  type Submission,
  type SubmissionSubject,
} from '@/shared/types/submissions';

import { SubmissionUniversityPanel } from './SubmissionUniversityPanel';
import {
  useGetSubmissionSubjectsQuery,
  useGetSubmissionUniversitiesQuery,
  useGetTodaySubmissionsQuery,
} from './submissionsApi';

export const statusTones: Record<SolutionStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'info',
  published: 'success',
  rejected: 'danger',
  archived: 'neutral',
};

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  ...SOLUTION_STATUSES.map((value) => ({ value, label: SOLUTION_STATUS_LABELS[value] })),
];

/** Rangli ikonka + son — fanlar jadvalidagi holat ustunlari. */
function CountCell({ value, tone }: { value: number; tone: 'approved' | 'pending' | 'rejected' }) {
  const styles = {
    approved: { Icon: CircleCheck, className: 'text-success' },
    pending: { Icon: Clock, className: 'text-warning' },
    rejected: { Icon: CircleX, className: 'text-danger' },
  } as const;

  const { Icon, className } = styles[tone];

  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-fg-soft">
      <Icon className={`size-4 shrink-0 ${className}`} strokeWidth={1.75} />
      {value} ta
    </span>
  );
}

export function SubmissionsPage() {
  const navigate = useLocaleNavigate();
  const [universityId, setUniversityId] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const debouncedSearch = useDebouncedValue(search, 350);
  const isAll = universityId === 'all';

  const universities = useGetSubmissionUniversitiesQuery();

  const todayQuery = useGetTodaySubmissionsQuery(
    {
      page,
      page_size: perPage,
      ...(status !== 'all' ? { status: status as SolutionStatus } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    { skip: !isAll },
  );

  const subjectsQuery = useGetSubmissionSubjectsQuery(
    {
      id: universityId,
      page,
      page_size: perPage,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    { skip: isAll },
  );

  const error = universities.error ?? todayQuery.error ?? subjectsQuery.error;
  const selected = universities.data?.find((item) => item.id === universityId);

  function selectUniversity(id: string) {
    setUniversityId(id);
    setPage(1);
    setSearch('');
  }

  const todayColumns: Column<Submission>[] = [
    {
      key: 'title',
      header: 'Yechim',
      className: 'max-w-[240px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block truncate text-fg" title={row.title}>
            {row.title}
          </span>
          <span className="block truncate text-xs text-fg-muted">
            {row.assignment_title} · {assignmentTypeLabel(row.assignment_type)}
          </span>
        </span>
      ),
    },
    {
      key: 'university',
      header: 'Institut',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft">
          {row.university_short_name || row.university_name}
        </span>
      ),
    },
    { key: 'subject', header: 'Fan', cell: (row) => row.subject_name },
    {
      key: 'course',
      header: 'Kurs',
      align: 'center',
      cell: (row) => <span className="tabular-nums">{row.course ?? '—'}</span>,
    },
    {
      key: 'variant',
      header: 'Variant',
      align: 'center',
      cell: (row) => <span className="tabular-nums">{row.variant_number}</span>,
    },
    {
      key: 'uploader',
      header: 'Yuborgan',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={row.uploader?.full_name || row.uploader?.phone || '?'} size="sm" />
          <span className="min-w-0 leading-snug">
            <span className="block whitespace-nowrap text-fg">
              {row.uploader?.full_name || '—'}
            </span>
            <span className="block text-xs text-fg-muted">{row.uploader?.phone}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Vaqt',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <Badge tone={statusTones[row.status]}>{SOLUTION_STATUS_LABELS[row.status]}</Badge>
      ),
    },
    {
      /*
       * Ro'yxat javobni faqat ko'rsatardi: uni ochib tekshirish, matnini
       * yoki narxini tuzatish va moderatsiyadan o'tkazish uchun bu yerdan
       * chiqib ketishga to'g'ri kelardi. Yechim tafsiloti bularning
       * hammasini bitta sahifada beradi.
       */
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <IconButton
          label={`${row.title} — ochish`}
          size="sm"
          onClick={() => navigate(`/yechimlar/${row.id}`)}
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </IconButton>
      ),
    },
  ];

  const subjectColumns: Column<SubmissionSubject>[] = [
    {
      key: 'name',
      header: 'Fan nomi',
      cell: (row) => <span className="text-fg">{row.name}</span>,
    },
    {
      key: 'course',
      header: 'Kurs',
      align: 'center',
      cell: (row) => <span className="tabular-nums">{row.course ?? '—'}</span>,
    },
    {
      key: 'submitted',
      header: 'Yuborilgan',
      cell: (row) => <Badge tone="success">{row.submitted_count} ta</Badge>,
    },
    {
      key: 'approved',
      header: 'Tasdiqlangan',
      cell: (row) => <CountCell value={row.approved_count} tone="approved" />,
    },
    {
      key: 'pending',
      header: 'Kutilmoqda',
      cell: (row) => <CountCell value={row.pending_count} tone="pending" />,
    },
    {
      key: 'rejected',
      header: 'Rad etilgan',
      cell: (row) => <CountCell value={row.rejected_count} tone="rejected" />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <IconButton
          label={`${row.name} — ochish`}
          size="sm"
          onClick={() => navigate(`/yuborilgan/javoblar/${row.id}`)}
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </IconButton>
      ),
    },
  ];

  const active = isAll ? todayQuery : subjectsQuery;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Yuborilgan javoblar' }]}
        title="Yuborilgan javoblar"
        subtitle="Institutlar bo'yicha yuborilgan topshiriq javoblarini ko'rish va boshqarish."
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row">
          <SubmissionUniversityPanel
            items={universities.data ?? []}
            selectedId={universityId}
            onSelect={selectUniversity}
            isLoading={universities.isLoading}
          />

          <Card className="min-w-0 flex-1 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
              <h2 className="flex flex-wrap items-center gap-3 text-lg font-semibold text-fg">
                {isAll
                  ? 'Bugun yuborilgan javoblar'
                  : `${selected?.short_name ?? ''} institutidagi fanlar`}
                <Badge tone="success">Jami: {formatSom(active.data?.count ?? 0)} ta</Badge>
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                {isAll && (
                  <Select
                    aria-label="Holat bo'yicha filtr"
                    size="sm"
                    options={statusOptions}
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setPage(1);
                    }}
                    className="w-44"
                  />
                )}

                <SearchInput
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="w-56"
                />

                {!isAll && (
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
                    onClick={() => selectUniversity('all')}
                  >
                    Orqaga
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4">
              {isAll ? (
                <Table
                  columns={todayColumns}
                  rows={todayQuery.data?.results ?? []}
                  rowKey={(row) => row.id}
                  isLoading={todayQuery.isLoading || todayQuery.isFetching}
                  skeletonRows={8}
                  density="compact"
                  emptyMessage="Bugun javob yuborilmagan"
                />
              ) : (
                <Table
                  columns={subjectColumns}
                  rows={subjectsQuery.data?.results ?? []}
                  rowKey={(row) => row.id}
                  isLoading={subjectsQuery.isLoading || subjectsQuery.isFetching}
                  skeletonRows={10}
                  density="compact"
                  emptyMessage="Bu institutda fan topilmadi"
                />
              )}
            </div>

            <Pagination
              page={page}
              totalPages={active.data?.total_pages ?? 1}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
            />
          </Card>
        </div>
      )}
    </>
  );
}
