import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import { useGetUniversitiesQuery } from '@/features/catalogue/catalogueApi';
import type { AdminSubjectRequest } from '@/shared/types/adminRequests';
import { COURSE_OPTIONS } from '@/shared/types/catalogue';

import {
  useApproveSubjectRequestMutation,
  useGetSubjectRequestsListQuery,
  useRejectSubjectRequestMutation,
} from './adminRequestsApi';
import { ApproveSubjectModal } from './ApproveSubjectModal';
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

const ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Avval yangi arizalar' },
  { value: 'created_at', label: 'Avval eski arizalar' },
  { value: '-reviewed_at', label: "Avval yangi ko'rib chiqilgan" },
  { value: 'reviewed_at', label: "Avval eski ko'rib chiqilgan" },
];

export function SubjectRequestsPage() {
  const [approve, approveState] = useApproveSubjectRequestMutation();
  const [reject, rejectState] = useRejectSubjectRequestMutation();

  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  /* `null` — tasdiqlash oynasi yopiq. */
  const [approveTarget, setApproveTarget] = useState<AdminSubjectRequest | null>(null);

  const { data: universities } = useGetUniversitiesQuery({
    page_size: 200,
    ordering: 'short_name',
  });

  return (
    <RequestsShell<AdminSubjectRequest>
      title="Fan qo'shish arizalari"
      breadcrumbLabel="Fan arizalari"
      orderingOptions={ORDERING_OPTIONS}
      extraParams={{ university, course }}
      extraFilter={
        <>
          <Select
            aria-label="Institut bo'yicha filtr"
            searchable
            searchPlaceholder="Institut nomi..."
            options={[
              { value: '', label: 'Barcha institutlar' },
              ...(universities?.results ?? []).map((item) => ({
                value: item.id,
                label: item.short_name || item.name,
              })),
            ]}
            value={university}
            onChange={(event) => setUniversity(event.target.value)}
            className="w-56"
          />

          <Select
            aria-label="Kurs bo'yicha filtr"
            options={[{ value: '', label: 'Barcha kurslar' }, ...COURSE_OPTIONS]}
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            className="w-44"
          />
        </>
      }
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
      rejectTitle="Fan arizasini rad etish"
      rowName={(row) => row.name}
      summaryLabel="ariza"
      emptyMessage="Bunday ariza topilmadi"
      afterContent={
        <ApproveSubjectModal
          request={approveTarget}
          isLoading={approveState.isLoading}
          error={approveState.error}
          onClose={() => setApproveTarget(null)}
          onConfirm={async (names) => {
            if (!approveTarget) return;

            try {
              await approve({ id: approveTarget.id, ...names }).unwrap();
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
