import { Check, CircleCheck, CircleX, Clock, FileText, X } from 'lucide-react';
import { useState } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DateCell } from '@/components/ui/Cells';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { RowActions } from '@/components/ui/RowActions';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import {
  EXPERIENCE_LEVEL_LABELS,
  REQUEST_STATUS_LABELS,
  WORK_DIRECTION_LABELS,
  type AdminFreelancerApplication,
  type RequestStatus,
} from '@/shared/types/adminFreelance';
import { REQUEST_STATUS_FILTER_OPTIONS } from '@/shared/types/adminRequests';

import { RejectReasonModal } from '../adminRequests/RejectReasonModal';
import {
  useApproveApplicationMutation,
  useGetApplicationStatsQuery,
  useGetFreelancerApplicationsQuery,
  useRejectApplicationMutation,
} from './adminFreelanceApi';

const statusTones: Record<RequestStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export function ApplicationsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState<AdminFreelancerApplication | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: stats } = useGetApplicationStatsQuery();
  const { data, isLoading, isFetching, error } = useGetFreelancerApplicationsQuery({
    page,
    page_size: perPage,
    ordering: '-created_at',
    ...(status !== 'all' ? { status: status as RequestStatus } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [approve, approveState] = useApproveApplicationMutation();
  const [reject, rejectState] = useRejectApplicationMutation();

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;

    try {
      await reject({ id: rejectTarget.id, reason }).unwrap();
    } catch {
      return;
    }

    setRejectTarget(null);
  }

  const columns: Column<AdminFreelancerApplication>[] = [
    {
      key: 'full_name',
      header: 'Arizachi',
      cell: (row) => (
        <span className="block">
          <span className="block font-medium text-fg">{row.full_name || '—'}</span>
          <span className="block text-xs text-fg-muted">{row.contact_phone}</span>
        </span>
      ),
    },
    {
      key: 'direction',
      header: "Yo'nalish",
      cell: (row) => (
        <span className="block">
          <span className="block whitespace-nowrap text-fg-soft">
            {WORK_DIRECTION_LABELS[row.direction] ?? row.direction}
          </span>
          <span className="block text-xs text-fg-muted">
            {EXPERIENCE_LEVEL_LABELS[row.experience_level] ?? row.experience_level}
          </span>
        </span>
      ),
    },
    {
      key: 'university',
      header: 'OTM',
      className: 'max-w-[200px]',
      cell: (row) => (
        <span className="block truncate text-fg-muted" title={row.university}>
          {row.university || '—'}
        </span>
      ),
    },
    {
      key: 'document',
      header: 'Hujjat',
      cell: (row) =>
        row.document_file ? (
          <a
            href={row.document_file}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <FileText className="size-3.5" />
            Ochish
          </a>
        ) : (
          <span className="text-xs text-fg-muted">—</span>
        ),
    },
    {
      key: 'created_at',
      header: 'Yuborilgan',
      cell: (row) => <DateCell value={row.created_at} />,
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <Badge tone={statusTones[row.status]}>{REQUEST_STATUS_LABELS[row.status]}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) =>
        row.status === 'pending' ? (
          <RowActions
            inlineCount={1}
            actions={[
              {
                label: `${row.full_name} — tasdiqlash`,
                icon: <Check className="size-4" strokeWidth={2} />,
                onSelect: () => void approve(row.id),
              },
              {
                label: `${row.full_name} — rad etish`,
                icon: <X className="size-4" strokeWidth={2} />,
                onSelect: () => setRejectTarget(row),
                destructive: true,
              },
            ]}
          />
        ) : (
          /* Ko'rib chiqilgan ariza qayta baholanmaydi — backend ham rad etadi. */
          <span className="text-xs text-fg-muted">Ko&apos;rib chiqilgan</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Freelancer arizalari"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Freelancer arizalari' }]}
      />

      {error ? (
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      ) : (
        <>
          {approveState.error && (
            <div className="mb-4 rounded-card border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
              {getApiErrorMessage(approveState.error)}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami arizalar"
              value={stats ? formatSom(stats.total) : '—'}
              icon={FileText}
              tone="info"
            />
            <StatCard
              label="Kutilmoqda"
              value={stats ? formatSom(stats.pending) : '—'}
              icon={Clock}
              tone="warning"
            />
            <StatCard
              label="Tasdiqlangan"
              value={stats ? formatSom(stats.approved) : '—'}
              icon={CircleCheck}
              tone="success"
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
              options={REQUEST_STATUS_FILTER_OPTIONS}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
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
              emptyMessage="Bunday ariza topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta ariza` : undefined}
            />
          </Card>
        </>
      )}

      <RejectReasonModal
        open={rejectTarget !== null}
        title="Arizani rad etish"
        itemName={rejectTarget?.full_name}
        isLoading={rejectState.isLoading}
        error={rejectState.error}
        onConfirm={(reason) => void confirmReject(reason)}
        onClose={() => setRejectTarget(null)}
      />
    </>
  );
}
