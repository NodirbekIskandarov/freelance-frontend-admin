import { FileText } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import type { Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import type { AdminAssignmentRequest } from '@/shared/types/adminRequests';

import {
  useApproveAssignmentRequestMutation,
  useGetAssignmentRequestsListQuery,
  useRejectAssignmentRequestMutation,
} from './adminRequestsApi';
import { RequestsShell, StatusBadge } from './RequestsShell';

const columns: Column<AdminAssignmentRequest>[] = [
  {
    key: 'title',
    header: 'Topshiriq',
    className: 'max-w-[280px]',
    cell: (row) => (
      <span className="block">
        <span className="block truncate font-medium text-fg" title={row.title}>
          {row.title}
        </span>
        {row.description && (
          <span className="mt-0.5 block truncate text-xs text-fg-muted" title={row.description}>
            {row.description}
          </span>
        )}
      </span>
    ),
  },
  {
    key: 'subject',
    header: 'Fan',
    className: 'max-w-[200px]',
    cell: (row) => (
      <span className="block truncate text-fg-soft" title={row.university_name}>
        {row.subject_name}
      </span>
    ),
  },
  {
    key: 'variant_count',
    header: 'Variant',
    align: 'center',
    cell: (row) => <span className="tabular-nums">{row.variant_count ?? '—'}</span>,
  },
  {
    key: 'file',
    header: 'Fayl',
    cell: (row) =>
      row.file ? (
        <a
          href={row.file}
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
    cell: (row) => (
      <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Holat',
    cell: (row) => (
      <span className="flex items-center gap-1.5">
        <StatusBadge status={row.status} />
        {row.reward_granted && <Badge tone="primary">Mukofotlangan</Badge>}
      </span>
    ),
  },
];

export function AssignmentRequestsPage() {
  const [approve, approveState] = useApproveAssignmentRequestMutation();
  const [reject, rejectState] = useRejectAssignmentRequestMutation();

  return (
    <RequestsShell<AdminAssignmentRequest>
      title="Topshiriq qo'shish arizalari"
      breadcrumbLabel="Topshiriq arizalari"
      columns={columns}
      useList={useGetAssignmentRequestsListQuery}
      approve={{
        run: (id) => void approve(id),
        isLoading: approveState.isLoading,
        error: approveState.error,
      }}
      reject={{
        run: async (id, reason) => {
          try {
            await reject({ id, reason }).unwrap();
            return true;
          } catch {
            return false;
          }
        },
        isLoading: rejectState.isLoading,
        error: rejectState.error,
      }}
      rejectTitle="Topshiriq arizasini rad etish"
      rowName={(row) => row.title}
      summaryLabel="ariza"
      emptyMessage="Bunday ariza topilmadi"
    />
  );
}
