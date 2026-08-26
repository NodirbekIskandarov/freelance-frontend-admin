import { ArrowLeft, Check, Download, Eye, Lock, LockOpen, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/cn';
import { formatDateTime, formatDecimalSom, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { assignmentTypeLabel } from '@/shared/types/assignments';
import {
  SOLUTION_STATUS_LABELS,
  type SolutionStatus,
  type Submission,
} from '@/shared/types/submissions';

import {
  useUpdateAssignmentMutation,
  useUpdateVariantMutation,
} from '../assignments/assignmentsApi';
import { PublishModal } from '../solutions/PublishModal';
import { RejectModal } from '../solutions/RejectModal';
import { SubmissionPreview } from './SubmissionPreview';
import { statusTones } from './SubmissionsPage';
import {
  useGetSubmissionAnswersQuery,
  useGetSubmissionAssignmentsQuery,
  useGetSubmissionVariantsQuery,
} from './submissionsApi';

/**
 * Holat qutilari.
 *
 * `approved` va `published` bitta tabda: moderator uchun ikkalasi ham
 * «o'tkazildi» degani, farqi esa narx belgilanganmi-yo'qmi — buni jadval
 * ustuni aytadi. Alohida tab qilinsa, ro'yxat deyarli har doim bo'sh
 * turadigan quti bilan uzayardi.
 */
const BUCKETS = [
  { id: 'pending', label: 'Yangi javoblar', statuses: ['pending'] },
  { id: 'accepted', label: 'Tasdiqlanganlar', statuses: ['approved', 'published'] },
  { id: 'rejected', label: 'Rad etilganlar', statuses: ['rejected'] },
  { id: 'archived', label: 'Arxivlanganlar', statuses: ['archived'] },
] as const;

type BucketId = (typeof BUCKETS)[number]['id'];

export function SubmissionDetailPage() {
  const { subjectId = '' } = useParams();

  const [assignmentId, setAssignmentId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [bucket, setBucket] = useState<BucketId>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<Submission | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Submission | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const assignments = useGetSubmissionAssignmentsQuery(
    { id: subjectId, page_size: 100 },
    { skip: !subjectId },
  );

  const variants = useGetSubmissionVariantsQuery(
    { id: assignmentId, ordering: 'number' },
    { skip: !assignmentId },
  );

  const activeBucket = BUCKETS.find((item) => item.id === bucket) ?? BUCKETS[0];

  const answers = useGetSubmissionAnswersQuery(
    {
      id: variantId,
      page,
      page_size: perPage,
      /*
       * Backend bitta `?status=` qabul qiladi. «Tasdiqlanganlar» ikkita
       * holatni qamraydi, shuning uchun u yerda filtr YUBORILMAYDI va
       * saralash mijozda bo'ladi — bitta variantdagi javoblar o'nlab
       * bo'ladi, yuzlab emas, shuning uchun bu arzon.
       */
      ...(activeBucket.statuses.length === 1
        ? { status: activeBucket.statuses[0] as SolutionStatus }
        : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    { skip: !variantId },
  );

  const [updateVariant, variantUpdate] = useUpdateVariantMutation();
  const [updateAssignment, assignmentUpdate] = useUpdateAssignmentMutation();

  /*
   * Tanlov holatda saqlanadi, effekt esa faqat u BO'SH bo'lganda birinchisini
   * qo'yadi: har ro'yxat kelganda qayta hisoblansa, qo'lda tanlangani ustiga
   * yozilib ketardi.
   */
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
  const assignment = assignments.data?.results.find((item) => item.id === assignmentId);
  const selectedVariant = variants.data?.find((item) => item.id === variantId);

  const rows = (answers.data?.results ?? []).filter((row) =>
    (activeBucket.statuses as readonly string[]).includes(row.status),
  );
  const previewed = rows.find((row) => row.id === previewId) ?? null;

  /*
   * Chegara serverda ham tekshiriladi; bu yerdagi hisob faqat tugmani
   * oldindan o'chirish uchun va JORIY sahifadagi qatorlarga tayanadi —
   * shuning uchun u kam baho berishi mumkin, ortiqcha emas. Xato holatda
   * backend baribir rad etadi va sabab modalda ko'rinadi.
   */
  const publishedCount = rows.filter((row) => row.status === 'published').length;
  const capacityLeft = selectedVariant
    ? Math.max(0, selectedVariant.max_published_solutions - publishedCount)
    : 0;

  const intakeOpen = Boolean(
    selectedVariant?.accepts_submissions && assignment?.accepts_submissions !== false,
  );

  function selectAssignment(id: string) {
    setAssignmentId(id);
    // Variant boshqa topshiriqqa tegishli — tanlovni bo'shatamiz,
    // effekt yangi ro'yxatning birinchisini qo'yadi.
    setVariantId('');
    setPreviewId(null);
    setPage(1);
  }

  function selectVariant(id: string) {
    setVariantId(id);
    setPreviewId(null);
    setPage(1);
  }

  function selectBucket(id: string) {
    setBucket(id as BucketId);
    setPreviewId(null);
    setPage(1);
  }

  const columns: Column<Submission>[] = [
    {
      key: 'title',
      header: 'Yechim',
      className: 'max-w-[240px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block truncate text-fg" title={row.title}>
            {row.title}
          </span>
          <span className="block truncate text-xs text-fg-muted" title={row.file_name}>
            {row.file_name || 'Faylsiz'}
          </span>
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
      key: 'price',
      header: 'Narx',
      align: 'right',
      /*
        Ikki raqam: yuklovchi so'ragani va admin belgilagani. Chop
        etilmagan yechimda ular bir xil, shuning uchun bittasi
        ko'rsatiladi — takrorlangan raqam qatorni shovqinga aylantirardi.
      */
      cell: (row) => (
        <span className="block leading-snug whitespace-nowrap tabular-nums">
          <span className="block text-fg">{formatDecimalSom(row.asking_price)}</span>
          {row.status === 'published' && row.price !== row.asking_price && (
            <span className="block text-xs text-success">→ {formatDecimalSom(row.price)}</span>
          )}
        </span>
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
        <span className="flex items-center justify-end gap-2">
          <IconButton
            label={`${row.title} — ochib ko'rish`}
            size="sm"
            tone={row.id === previewId ? 'info' : 'neutral'}
            onClick={() => setPreviewId(row.id)}
          >
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>

          {row.file_url && (
            <IconButton
              label={`${row.title} — yuklab olish`}
              size="sm"
              onClick={() => window.open(row.file_url, '_blank', 'noopener')}
            >
              <Download className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}

          {/* Tasdiqlash va rad etish faqat hali qaror qilinmagan javobda:
              chop etilganini qayta tasdiqlab bo'lmaydi va backend ham buni
              rad etadi. */}
          {(row.status === 'pending' || row.status === 'approved') && (
            <>
              <IconButton
                label={
                  capacityLeft === 0
                    ? "Chop etish chegarasi to'lgan"
                    : `${row.title} — tasdiqlash va narx belgilash`
                }
                size="sm"
                tone="success"
                disabled={capacityLeft === 0}
                onClick={() => setPublishTarget(row)}
              >
                <Check className="size-4" strokeWidth={2} />
              </IconButton>

              {row.status === 'pending' && (
                <IconButton
                  label={`${row.title} — rad etish`}
                  size="sm"
                  tone="danger"
                  onClick={() => setRejectTarget(row)}
                >
                  <X className="size-4" strokeWidth={2} />
                </IconButton>
              )}
            </>
          )}
        </span>
      ),
    },
  ];

  /** Tab sanoqlari — faqat JORIY variantniki, boshqasiniki emas. */
  function bucketCount(statuses: readonly string[]): number | undefined {
    if (!selectedVariant) return undefined;
    const byStatus: Record<string, number> = {
      pending: selectedVariant.pending_count,
      approved: selectedVariant.approved_count,
      rejected: selectedVariant.rejected_count,
      archived: selectedVariant.archived_count,
    };
    return statuses.reduce((total, status) => total + (byStatus[status] ?? 0), 0);
  }

  const tabItems = BUCKETS.map((item) => ({
    id: item.id,
    label: item.label,
    count: bucketCount(item.statuses),
  }));

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
        subtitle="Topshiriq va variant tanlang — javoblarni shu yerda ochib tekshiring."
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
          <Card className="flex w-full flex-col p-5 xl:w-[280px] xl:shrink-0">
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

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-fg">
                    {assignment?.title ?? 'Topshiriq'}
                  </h2>
                  <p className="mt-1 text-xs text-fg-muted">
                    {assignment ? assignmentTypeLabel(assignment.type, 'Boshqa') : '—'}
                    {selectedVariant && (
                      <>
                        {' · '}
                        {publishedCount}/{selectedVariant.max_published_solutions} chop etilgan
                      </>
                    )}
                  </p>
                </div>

                {/*
                  Qabulni yopish variant qavatida turadi. Topshiriq qavati ham
                  yopishi mumkin, lekin u barcha variantlarga tegadi — shuning
                  uchun topshiriq yopilgan bo'lsa tugma buni aytadi va aynan
                  o'sha qavatni ochishni taklif qiladi, aks holda moderator
                  variantni ochib, natija chiqmaganini ko'rib turardi.
                */}
                {selectedVariant && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={intakeOpen ? 'success' : 'neutral'}>
                      {intakeOpen ? 'Qabul ochiq' : 'Qabul yopiq'}
                    </Badge>

                    {assignment?.accepts_submissions === false ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<LockOpen className="size-4" strokeWidth={1.75} />}
                        disabled={assignmentUpdate.isLoading}
                        onClick={() =>
                          void updateAssignment({
                            id: assignment.id,
                            accepts_submissions: true,
                          })
                        }
                      >
                        Topshiriq bo&apos;yicha ochish
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={
                          selectedVariant.accepts_submissions ? (
                            <Lock className="size-4" strokeWidth={1.75} />
                          ) : (
                            <LockOpen className="size-4" strokeWidth={1.75} />
                          )
                        }
                        disabled={variantUpdate.isLoading}
                        onClick={() =>
                          void updateVariant({
                            id: selectedVariant.id,
                            accepts_submissions: !selectedVariant.accepts_submissions,
                          })
                        }
                      >
                        {selectedVariant.accepts_submissions ? 'Qabulni yopish' : 'Qabulni ochish'}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-line pt-4">
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
                          onClick={() => selectVariant(item.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            'flex items-center gap-1.5 rounded-control border px-3 py-1.5 text-sm transition-colors',
                            isSelected
                              ? 'border-primary/50 bg-primary/10 font-medium text-primary'
                              : 'border-line text-fg-soft hover:bg-elevated',
                          )}
                        >
                          {item.number}-variant
                          <span className="text-xs text-fg-muted">({item.submitted_count})</span>
                          {/* Yopiq variant ro'yxatda ham belgilanadi —
                              moderator qaysi biriga javob kelmayotganini
                              o'ylab qolmasin. */}
                          {!item.accepts_submissions && (
                            <Lock className="size-3 text-fg-dim" strokeWidth={2} />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>

            <SubmissionPreview submission={previewed} />

            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
                <h2 className="flex flex-wrap items-center gap-3 text-lg font-semibold text-fg">
                  {selectedVariant ? `${selectedVariant.number}-variant javoblari` : 'Javoblar'}
                  {/* Talab: nechta odam shu variantga yechim so'ragan. */}
                  {selectedVariant && selectedVariant.request_count > 0 && (
                    <Badge tone="orange">{selectedVariant.request_count} ta so&apos;rov</Badge>
                  )}
                  {selectedVariant && capacityLeft === 0 && (
                    <Badge tone="neutral">Chop etish chegarasi to&apos;lgan</Badge>
                  )}
                </h2>

                <SearchInput
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="w-56"
                />
              </div>

              <Tabs items={tabItems} active={bucket} onChange={selectBucket} className="mt-3" />

              <Table
                columns={columns}
                rows={rows}
                rowKey={(row) => row.id}
                isLoading={answers.isLoading || answers.isFetching}
                skeletonRows={6}
                density="compact"
                emptyMessage={variantId ? "Bu qutida javob yo'q" : 'Variant tanlang'}
              />

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
        </div>
      )}

      {publishTarget && (
        <PublishModal
          open
          solutionId={publishTarget.id}
          defaultPrice={publishTarget.asking_price}
          onClose={() => setPublishTarget(null)}
          onPublished={() => setPublishTarget(null)}
        />
      )}

      {rejectTarget && (
        <RejectModal
          open
          solutionId={rejectTarget.id}
          onClose={() => setRejectTarget(null)}
          onRejected={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}
