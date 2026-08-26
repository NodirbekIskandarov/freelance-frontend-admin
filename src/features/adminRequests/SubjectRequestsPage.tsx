import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import type { AdminSubjectRequest } from '@/shared/types/adminRequests';

import {
  useApproveSubjectRequestMutation,
  useGetSubjectRequestsListQuery,
  useRejectSubjectRequestMutation,
} from './adminRequestsApi';
import { RequestsShell, StatusBadge } from './RequestsShell';

/** «2-kurs · 4-semestr» — ikkalasi ham bo'lmasa qator umuman chizilmaydi. */
function courseLine(row: AdminSubjectRequest): string | null {
  const parts = [
    row.course ? `${row.course}-kurs` : null,
    row.semester ? `${row.semester}-semestr` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : null;
}

const columns: Column<AdminSubjectRequest>[] = [
  {
    key: 'name',
    header: 'Fan nomi',
    className: 'max-w-[200px]',
    cell: (row) => (
      <span className="block truncate font-medium text-fg" title={row.name}>
        {row.name}
      </span>
    ),
  },
  {
    key: 'university',
    header: 'Institut',
    className: 'max-w-[220px]',
    cell: (row) => (
      <span className="block min-w-0">
        <span className="block truncate text-[13px] text-fg-soft" title={row.university_name}>
          {row.university_name}
        </span>
        {row.university_short_name && (
          <span className="text-[11px] text-primary">({row.university_short_name})</span>
        )}
      </span>
    ),
  },
  {
    key: 'note',
    header: "Qisqacha ma'lumot",
    className: 'max-w-[260px]',
    cell: (row) => (
      <span className="block min-w-0">
        <span className="line-clamp-2 text-[13px] leading-snug text-fg-soft" title={row.note}>
          {row.note || '—'}
        </span>
        {courseLine(row) && (
          <span className="mt-0.5 block text-[11px] text-fg-dim">{courseLine(row)}</span>
        )}
      </span>
    ),
  },
  {
    key: 'user',
    header: 'Ariza beruvchi',
    className: 'max-w-[180px]',
    cell: (row) => (
      <span className="block min-w-0">
        <span className="block truncate text-[13px] font-medium text-fg">
          {row.user?.full_name?.trim() || row.user?.phone || '—'}
        </span>
        {row.user?.phone && row.user.full_name?.trim() && (
          <span className="block truncate text-[11px] text-fg-dim">{row.user.phone}</span>
        )}
      </span>
    ),
  },
  {
    key: 'created_at',
    header: 'Ariza sanasi',
    cell: (row) => (
      <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
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
      headerActions={
        <Link to="/fanlar">
          <Button variant="secondary" icon={<ArrowLeft className="size-4" />}>
            Fanlar ro&apos;yxatiga qaytish
          </Button>
        </Link>
      }
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
