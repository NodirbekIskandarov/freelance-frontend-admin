import { Badge } from '@/components/ui/Badge';
import type { Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import type { AdminSubjectRequest } from '@/shared/types/adminRequests';

import {
  useApproveSubjectRequestMutation,
  useGetSubjectRequestsListQuery,
  useRejectSubjectRequestMutation,
} from './adminRequestsApi';
import { RequestsShell, StatusBadge } from './RequestsShell';

const columns: Column<AdminSubjectRequest>[] = [
  {
    key: 'name',
    header: 'Fan nomi',
    cell: (row) => <span className="font-medium text-fg">{row.name}</span>,
  },
  {
    key: 'university',
    header: 'Institut',
    className: 'max-w-[240px]',
    cell: (row) => (
      <span className="block truncate text-fg-soft" title={row.university_name}>
        {row.university_short_name || row.university_name}
      </span>
    ),
  },
  {
    key: 'course',
    header: 'Kurs',
    align: 'center',
    cell: (row) => <span className="tabular-nums">{row.course ?? '—'}</span>,
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
        {/* Mukofot faqat tasdiqlangan arizada beriladi. */}
        {row.reward_granted && <Badge tone="primary">Mukofotlangan</Badge>}
      </span>
    ),
  },
];

export function SubjectRequestsPage() {
  const [approve, approveState] = useApproveSubjectRequestMutation();
  const [reject, rejectState] = useRejectSubjectRequestMutation();

  return (
    <RequestsShell<AdminSubjectRequest>
      title="Fan qo'shish arizalari"
      breadcrumbLabel="Fan arizalari"
      columns={columns}
      useList={useGetSubjectRequestsListQuery}
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
      rejectTitle="Fan arizasini rad etish"
      rowName={(row) => row.name}
      summaryLabel="ariza"
      emptyMessage="Bunday ariza topilmadi"
    />
  );
}
