import { ArrowLeft, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { cn } from '@/lib/cn';
import { formatDateTime, formatDecimalSom, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { assignmentTypeLabel } from '@/shared/types/assignments';
import {
  SOLUTION_STATUS_LABELS,
  SOLUTION_STATUSES,
  type SolutionStatus,
  type Submission,
} from '@/shared/types/submissions';

import { statusTones } from './SubmissionsPage';
import {
  useGetSubmissionAnswersQuery,
  useGetSubmissionAssignmentsQuery,
  useGetSubmissionVariantsQuery,
} from './submissionsApi';

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  ...SOLUTION_STATUSES.map((value) => ({ value, label: SOLUTION_STATUS_LABELS[value] })),
];

/**
 * Fan ichidagi drill-down: topshiriq → variant → javoblar.
 *
 * Tanlov `useEffect` bilan emas, ro'yxat kelgach hisoblanadi degan
 * yo'l to'g'ri kelmadi: foydalanuvchi qo'lda boshqasini tanlagach uni
 * qayta yozib yuborardi. Shuning uchun tanlov holatda saqlanadi va
 * effect faqat u BO'SH bo'lganda birinchisini qo'yadi.
 */
export function SubmissionDetailPage() {
  const { subjectId = '' } = useParams();

  const [assignmentId, setAssignmentId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const debouncedSearch = useDebouncedValue(search, 350);

  const assignments = useGetSubmissionAssignmentsQuery(
    { id: subjectId, page_size: 100 },
    { skip: !subjectId },
  );

  const variants = useGetSubmissionVariantsQuery(
    { id: assignmentId, ordering: 'number' },
    { skip: !assignmentId },
  );

  const answers = useGetSubmissionAnswersQuery(
    {
      id: variantId,
      page,
      page_size: perPage,
      ...(status !== 'all' ? { status: status as SolutionStatus } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    { skip: !variantId },
  );

  const firstAssignment = assignments.data?.results[0]?.id;
  useEffect(() => {
    if (!assignmentId && firstAssignment) setAssignmentId(firstAssignment);
  }, [assignmentId, firstAssignment]);

  const firstVariant = variants.data?.[0]?.id;
  useEffect(() => {
    if (!variantId && firstVariant) setVariantId(firstVariant);
  }, [variantId, firstVariant]);

  const error = assignments.error ?? variants.error ?? answers.error;
  const subjectName = assignments.data?.results[0]?.subject_name ?? '';
  const selectedVariant = variants.data?.find((item) => item.id === variantId);

  function selectAssignment(id: string) {
    setAssignmentId(id);
    // Variant boshqa topshiriqqa tegishli — tanlovni bo'shatamiz,
    // effect yangi ro'yxatning birinchisini qo'yadi.
    setVariantId('');
    setPage(1);
  }

  const columns: Column<Submission>[] = [
    {
      key: 'title',
      header: 'Yechim',
      className: 'max-w-[260px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block truncate text-fg" title={row.title}>
            {row.title}
          </span>
          {row.description && (
            <span className="block truncate text-xs text-fg-muted" title={row.description}>
              {row.description}
            </span>
          )}
        </span>
      ),
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
      key: 'file',
      header: 'Fayl',
      className: 'max-w-[180px]',
      cell: (row) =>
        row.file_url ? (
          <a
            href={row.file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 text-fg-soft hover:text-primary"
            title={row.file_name}
          >
            <FileText className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{row.file_name || 'Fayl'}</span>
          </a>
        ) : (
          <span className="text-fg-muted">—</span>
        ),
    },
    {
      key: 'price',
      header: 'Narx',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">{formatDecimalSom(row.price)}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Yuborilgan',
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
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <Link
          to={`/yechimlar/${row.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Moderatsiya
        </Link>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbsPosition="above"
        breadcrumbs={[
          { label: 'Bosh sahifa', to: '/' },
          { label: 'Yuborilgan javoblar', to: '/yuborilgan/javoblar' },
          { label: subjectName || 'Fan' },
        ]}
        title={subjectName || 'Fan javoblari'}
        subtitle="Topshiriq va variant tanlang — yuborilgan javoblar quyida."
        actions={
          <Button
            variant="secondary"
            icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
            onClick={() => history.back()}
          >
            Orqaga
          </Button>
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row">
          <Card className="flex w-full flex-col p-5 xl:w-[300px] xl:shrink-0">
            <h2 className="text-base font-semibold text-fg">Topshiriqlar</h2>

            <div className="mt-4 flex flex-col gap-1">
              {assignments.isLoading ? (
                Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-control bg-elevated" />
                ))
              ) : assignments.data?.results.length === 0 ? (
                <p className="py-6 text-center text-sm text-fg-muted">Topshiriq yo&apos;q</p>
              ) : (
                assignments.data?.results.map((item) => {
                  const isSelected = item.id === assignmentId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectAssignment(item.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex items-start gap-2.5 rounded-control border px-3 py-2 text-left transition-colors',
                        isSelected
                          ? 'border-primary/50 bg-primary/8'
                          : 'border-transparent hover:bg-elevated',
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-sm',
                            isSelected ? 'font-medium text-primary' : 'text-fg-soft',
                          )}
                          title={item.title}
                        >
                          {item.title}
                        </span>
                        <span className="block text-xs text-fg-muted">
                          {assignmentTypeLabel(item.type)}
                        </span>
                      </span>

                      <span
                        className={cn(
                          'shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium',
                          isSelected ? 'bg-primary/15 text-primary' : 'bg-elevated text-fg-muted',
                        )}
                      >
                        {formatSom(item.submitted_count)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="min-w-0 flex-1 overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <p className="text-xs font-semibold tracking-wider text-fg-muted uppercase">
                Variantlar
              </p>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {variants.isLoading ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <div
                      key={index}
                      className="h-8 w-20 animate-pulse rounded-control bg-elevated"
                    />
                  ))
                ) : variants.data?.length === 0 ? (
                  <p className="text-sm text-fg-muted">Variant yo&apos;q</p>
                ) : (
                  variants.data?.map((item) => {
                    const isSelected = item.id === variantId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setVariantId(item.id);
                          setPage(1);
                        }}
                        aria-pressed={isSelected}
                        className={cn(
                          'rounded-control border px-3 py-1.5 text-sm transition-colors',
                          isSelected
                            ? 'border-primary/50 bg-primary/10 font-medium text-primary'
                            : 'border-line text-fg-soft hover:bg-elevated',
                        )}
                      >
                        {item.number}-variant
                        <span className="ml-1.5 text-xs text-fg-muted">
                          ({item.submitted_count})
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
              <h2 className="flex flex-wrap items-center gap-3 text-lg font-semibold text-fg">
                {selectedVariant ? `${selectedVariant.number}-variant javoblari` : 'Javoblar'}
                <Badge tone="success">Jami: {formatSom(answers.data?.count ?? 0)} ta</Badge>
                {/* Talab: nechta odam shu variantga yechim so'ragan. */}
                {selectedVariant && selectedVariant.request_count > 0 && (
                  <Badge tone="orange">{selectedVariant.request_count} ta so&apos;rov</Badge>
                )}
              </h2>

              <div className="flex flex-wrap items-center gap-3">
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
                <SearchInput
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="w-56"
                />
              </div>
            </div>

            <div className="mt-4">
              <Table
                columns={columns}
                rows={answers.data?.results ?? []}
                rowKey={(row) => row.id}
                isLoading={answers.isLoading || answers.isFetching}
                skeletonRows={8}
                density="compact"
                emptyMessage={variantId ? 'Bu variantga javob yuborilmagan' : 'Variant tanlang'}
              />
            </div>

            <Pagination
              page={page}
              totalPages={answers.data?.total_pages ?? 1}
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
