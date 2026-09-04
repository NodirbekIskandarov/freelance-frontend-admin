import { ArrowLeft, FileText } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

import { DateCell } from '@/components/ui/Cells';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import type { AdminAssignmentRequest } from '@/shared/types/adminRequests';

import {
  useApproveAssignmentRequestMutation,
  useGetAssignmentRequestsListQuery,
  useRejectAssignmentRequestMutation,
} from './adminRequestsApi';
import { ApproveAssignmentModal } from './ApproveAssignmentModal';
import { RequestsShell, StatusBadge } from './RequestsShell';
import { PersonCell } from '@/components/ui/PersonCell';

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
    key: 'user',
    header: 'Ariza beruvchi',
    className: 'max-w-[180px]',
    cell: (row) => <PersonCell name={row.user?.full_name} phone={row.user?.phone} />,
  },
  {
    key: 'created_at',
    header: 'Yuborilgan',
    cell: (row) => <DateCell value={row.created_at} />,
  },
  {
    key: 'reviewed',
    header: "Ko'rib chiqdi",
    className: 'max-w-[220px]',
    cell: (row) => {
      /*
       * Hali ko'rilmagan ariza uchun chiziqcha: bo'sh katak «ma'lumot yo'q»
       * bilan «hali bo'lmagan»ni farqlamasdi.
       */
      if (row.status === 'pending') return <span className="text-fg-dim">—</span>;

      const reviewer = row.reviewed_by?.full_name?.trim() || row.reviewed_by?.phone;

      return (
        <span className="block min-w-0">
          <span className="block truncate text-[13px] text-fg-soft" title={reviewer ?? undefined}>
            {reviewer ?? "Noma'lum admin"}
          </span>
          {/*
            `reviewed_at` maydoni keyin qo'shilgan — undan oldin ko'rib
            chiqilgan arizalarda u bo'sh. Sana o'rniga taxmin yozgandan ko'ra
            ochiq aytgan ma'qul.
          */}
          <span className="mt-0.5 block truncate text-[11px] text-fg-dim">
            {row.reviewed_at ? formatDateTime(row.reviewed_at) : 'sana qayd etilmagan'}
          </span>

          {/*
            Rad etish sababi qaror bilan bir ustunda: u qarorning bir qismi,
            alohida ustun esa jadvalni kengaytirib, sabab yo'q qatorlarda
            bo'sh turardi. To'liq matn `title` da.
          */}
          {row.status === 'rejected' && row.reject_reason && (
            <span className="mt-1 block truncate text-[11px] text-danger" title={row.reject_reason}>
              {row.reject_reason}
            </span>
          )}
        </span>
      );
    },
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

const ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Avval yangi arizalar' },
  { value: 'created_at', label: 'Avval eski arizalar' },
  { value: '-reviewed_at', label: "Avval yangi ko'rib chiqilgan" },
  { value: 'reviewed_at', label: "Avval eski ko'rib chiqilgan" },
];

export function AssignmentRequestsPage() {
  /* `null` — tasdiqlash oynasi yopiq. */
  const [approveTarget, setApproveTarget] = useState<AdminAssignmentRequest | null>(null);

  const [approve, approveState] = useApproveAssignmentRequestMutation();
  const [reject, rejectState] = useRejectAssignmentRequestMutation();

  return (
    <RequestsShell<AdminAssignmentRequest>
      title="Topshiriq qo'shish arizalari"
      breadcrumbLabel="Topshiriq arizalari"
      headerActions={
        <Link to="/topshiriqlar">
          <Button variant="secondary" icon={<ArrowLeft className="size-4" />}>
            Topshiriqlar ro&apos;yxatiga qaytish
          </Button>
        </Link>
      }
      columns={columns}
      orderingOptions={ORDERING_OPTIONS}
      useList={useGetAssignmentRequestsListQuery}
      approve={{
        // To'g'ridan-to'g'ri tasdiqlamaymiz: avval nomni ikki tilda so'raymiz.
        run: (_id, row) => setApproveTarget(row),
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
      afterContent={
        <ApproveAssignmentModal
          request={approveTarget}
          isLoading={approveState.isLoading}
          error={approveState.error}
          onClose={() => setApproveTarget(null)}
          onConfirm={async (titles) => {
            if (!approveTarget) return;

            try {
              await approve({ id: approveTarget.id, ...titles }).unwrap();
            } catch {
              return;
            }

            setApproveTarget(null);
          }}
        />
      }
    />
  );
}
