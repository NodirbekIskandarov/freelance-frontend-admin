import { Badge } from '@/components/ui/Badge';
import type { Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import { REPORT_REASON_LABELS, type AdminSolutionReport } from '@/shared/types/adminRequests';

import {
  useApproveReportMutation,
  useGetSolutionReportsQuery,
  useRejectReportMutation,
} from './adminRequestsApi';
import { RequestsShell, StatusBadge } from './RequestsShell';

const columns: Column<AdminSolutionReport>[] = [
  {
    key: 'solution_title',
    header: 'Yechim',
    className: 'max-w-[260px]',
    cell: (row) => (
      <span className="block">
        <span className="block truncate font-medium text-fg" title={row.solution_title}>
          {row.solution_title}
        </span>
        <span className="block text-xs text-fg-muted">{row.solution_status}</span>
      </span>
    ),
  },
  {
    key: 'reason',
    header: 'Sabab',
    cell: (row) => <Badge tone="orange">{REPORT_REASON_LABELS[row.reason] ?? row.reason}</Badge>,
  },
  {
    key: 'description',
    header: 'Izoh',
    className: 'max-w-[260px]',
    cell: (row) => (
      <span className="block truncate text-fg-soft" title={row.description}>
        {row.description || '—'}
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
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

export function SolutionReportsPage() {
  const [approve, approveState] = useApproveReportMutation();
  const [reject, rejectState] = useRejectReportMutation();

  return (
    <RequestsShell<AdminSolutionReport>
      title="Yechim shikoyatlari"
      breadcrumbLabel="Shikoyatlar"
      columns={columns}
      useList={useGetSolutionReportsQuery}
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
      rejectTitle="Shikoyatni rad etish"
      rowName={(row) => row.solution_title}
      summaryLabel="shikoyat"
      emptyMessage="Shikoyat topilmadi"
    />
  );
}
