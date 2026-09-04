import { DateCell } from '@/components/ui/Cells';
import { Badge } from '@/components/ui/Badge';
import type { Column } from '@/components/ui/Table';
import type { AdminUniversityRequest } from '@/shared/types/adminRequests';

import { RequestsShell, StatusBadge } from './RequestsShell';
import {
  useApproveUniversityRequestMutation,
  useGetUniversityRequestsListQuery,
  useRejectUniversityRequestMutation,
} from './adminRequestsApi';

const columns: Column<AdminUniversityRequest>[] = [
  {
    key: 'name',
    header: 'Institut nomi',
    className: 'max-w-[280px]',
    cell: (row) => (
      <span className="block">
        <span className="block truncate font-medium text-fg" title={row.name}>
          {row.name}
        </span>
        {row.short_name && <span className="block text-xs text-fg-muted">{row.short_name}</span>}
      </span>
    ),
  },
  {
    key: 'city',
    header: 'Shahar',
    cell: (row) => <span className="whitespace-nowrap text-fg-soft">{row.city || '—'}</span>,
  },
  {
    key: 'requester',
    header: 'Arizachi',
    cell: (row) => (
      <span className="block whitespace-nowrap">
        <span className="block text-fg-soft">{row.user?.full_name || '—'}</span>
        <span className="block text-xs text-fg-muted">
          {row.user?.phone || row.requester_phone}
        </span>
      </span>
    ),
  },
  {
    key: 'comment',
    header: 'Izoh',
    className: 'max-w-[220px]',
    cell: (row) => (
      <span className="block truncate text-fg-muted" title={row.comment}>
        {row.comment || '—'}
      </span>
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
      <span className="flex items-center gap-1.5">
        <StatusBadge status={row.status} />
        {/* Mukofot faqat tasdiqlangan arizada beriladi. */}
        {row.reward_granted && <Badge tone="primary">Mukofotlangan</Badge>}
      </span>
    ),
  },
];

/**
 * Institut qo'shish arizalari navbati.
 *
 * Ekran bir marta OLIB TASHLANGAN edi va sababi to'g'ri edi: o'sha
 * paytda saytda bunday ariza yuboradigan joy yo'q, ya'ni navbat doim
 * bo'sh turardi. Backend tomoni (model, servis, endpointlar, mukofot)
 * o'shanda ham to'liq edi va tegilmadi — shuning uchun qaytarish
 * boshqatdan yozish emas.
 *
 * Fan va topshiriq arizalari bilan bir xil qobiq (`RequestsShell`):
 * uchala navbat ham bir xil ish — ko'rib chiqish, tasdiqlash yoki
 * sabab bilan rad etish.
 */
export function UniversityRequestsPage() {
  const [approve, approveState] = useApproveUniversityRequestMutation();
  const [reject, rejectState] = useRejectUniversityRequestMutation();

  return (
    <RequestsShell<AdminUniversityRequest>
      title="Institut qo'shish arizalari"
      breadcrumbLabel="Institut arizalari"
      columns={columns}
      useList={useGetUniversityRequestsListQuery}
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
      rejectTitle="Institut arizasini rad etish"
      rowName={(row) => row.name}
      summaryLabel="ariza"
      emptyMessage="Bunday ariza topilmadi"
    />
  );
}
