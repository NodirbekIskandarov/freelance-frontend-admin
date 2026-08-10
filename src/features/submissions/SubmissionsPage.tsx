import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { getApiErrorMessage } from '@/shared/api';
import type { InstituteSubjectSubmissions, TodaySubmission } from '@/shared/types/submissions';

import { SubmissionInstitutePanel } from './SubmissionInstitutePanel';
import { useGetInstituteSubmissionsQuery, useGetTodaySubmissionsQuery } from './submissionsApi';

/** Rangli ikonka + son (17-rasmdagi holat ustunlari). */
function CountCell({
  value,
  tone,
}: {
  value: number;
  tone: 'approved' | 'reviewing' | 'rejected';
}) {
  const styles = {
    approved: { Icon: CircleCheck, className: 'text-success' },
    reviewing: { Icon: Clock, className: 'text-warning' },
    rejected: { Icon: CircleX, className: 'text-danger' },
  } as const;

  const { Icon, className } = styles[tone];

  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-fg-soft">
      <Icon className={`size-4 shrink-0 ${className}`} strokeWidth={1.75} />
      {value} ta
    </span>
  );
}

export function SubmissionsPage() {
  const navigate = useNavigate();
  const [instituteId, setInstituteId] = useState('all');

  const isAll = instituteId === 'all';

  const todayQuery = useGetTodaySubmissionsQuery(undefined, { skip: !isAll });
  const instituteQuery = useGetInstituteSubmissionsQuery(instituteId, { skip: isAll });

  const institutes = todayQuery.data?.institutes ?? instituteQuery.data?.institutes ?? [];
  const error = todayQuery.error ?? instituteQuery.error;

  const todayColumns: Column<TodaySubmission>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (_row, index) => index + 1,
    },
    {
      key: 'task',
      header: 'Topshiriq nomi',
      className: 'max-w-[190px]',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block text-fg">{row.taskName}</span>
          <span className="block text-xs text-fg-muted">{row.taskType}</span>
        </span>
      ),
    },
    { key: 'institute', header: 'Institut', cell: (row) => row.institute },
    { key: 'subject', header: 'Fan', cell: (row) => row.subject },
    { key: 'course', header: 'Kurs', cell: (row) => row.course },
    { key: 'variant', header: 'Variant', cell: (row) => row.variant },
    {
      key: 'sender',
      header: 'Yuborgan',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={row.sender.name} src={row.sender.avatarUrl} size="sm" />
          <span className="min-w-0 leading-snug">
            <span className="block whitespace-nowrap text-fg">{row.sender.name}</span>
            <span className="block text-xs text-fg-muted">{row.sender.username}</span>
          </span>
        </span>
      ),
    },
    { key: 'time', header: 'Vaqt', cell: (row) => row.time },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <IconButton
          label={`${row.taskName} — ko'rish`}
          size="sm"
          onClick={() => navigate(`/yuborilgan/javoblar/${row.institute}/1`)}
        >
          <Eye className="size-4" strokeWidth={1.75} />
        </IconButton>
      ),
    },
  ];

  const subjectColumns: Column<InstituteSubjectSubmissions>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (_row, index) => index + 1,
    },
    { key: 'name', header: 'Fan nomi', cell: (row) => <span className="text-fg">{row.name}</span> },
    { key: 'course', header: 'Kurs', cell: (row) => row.course },
    {
      key: 'submitted',
      header: 'Yuborilgan javoblar soni',
      cell: (row) => <Badge tone="success">{row.submitted} ta</Badge>,
    },
    {
      key: 'approved',
      header: 'Tasdiqlangan',
      cell: (row) => <CountCell value={row.approved} tone="approved" />,
    },
    {
      key: 'reviewing',
      header: 'Tekshirilmoqda',
      cell: (row) => <CountCell value={row.reviewing} tone="reviewing" />,
    },
    {
      key: 'rejected',
      header: 'Rad etilgan',
      cell: (row) => <CountCell value={row.rejected} tone="rejected" />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <IconButton
          label={`${row.name} — ochish`}
          size="sm"
          onClick={() => navigate(`/yuborilgan/javoblar/${instituteId}/${row.id}`)}
        >
          <ChevronRight className="size-4" strokeWidth={2} />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbsPosition="above"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Yuborilgan javoblar' }]}
        title="Yuborilgan javoblar"
        subtitle="Institutlar bo‘yicha yuborilgan topshiriq javoblarini ko‘rish va boshqarish."
        actions={
          <Select
            aria-label="Sana"
            options={[{ value: 'today', label: '07.05.2025' }]}
            icon={<Calendar className="size-4" strokeWidth={1.75} />}
            className="w-48"
          />
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row">
          <SubmissionInstitutePanel
            items={institutes}
            selectedId={instituteId}
            onSelect={setInstituteId}
            isLoading={institutes.length === 0}
          />

          <Card className="min-w-0 flex-1 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
              <h2 className="flex flex-wrap items-center gap-3 text-lg font-semibold text-fg">
                {isAll
                  ? 'Bugun yuborilgan javoblar'
                  : `${instituteQuery.data?.instituteShort ?? ''} institutidagi fanlar`}
                <Badge tone="success">
                  {isAll
                    ? `Jami: ${todayQuery.data?.total ?? 0} ta`
                    : `Jami fanlar: ${instituteQuery.data?.totalSubjects ?? 0}`}
                </Badge>
              </h2>

              {isAll ? (
                <Button
                  variant="secondary"
                  trailing={<ArrowRight className="size-4" strokeWidth={1.75} />}
                >
                  Barchasini ko‘rish
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
                  onClick={() => setInstituteId('all')}
                >
                  Orqaga qaytish
                </Button>
              )}
            </div>

            <div className="mt-4">
              {isAll ? (
                <Table
                  columns={todayColumns}
                  rows={todayQuery.data?.items ?? []}
                  rowKey={(row) => row.id}
                  isLoading={todayQuery.isLoading}
                  skeletonRows={8}
                  density="compact"
                  emptyMessage="Bugun javob yuborilmagan"
                />
              ) : (
                <Table
                  columns={subjectColumns}
                  rows={instituteQuery.data?.items ?? []}
                  rowKey={(row) => row.id}
                  isLoading={instituteQuery.isLoading}
                  skeletonRows={10}
                  density="compact"
                  emptyMessage="Bu institutda fan topilmadi"
                />
              )}
            </div>

            <div className="flex justify-center border-t border-line py-4">
              <Button
                variant="secondary"
                trailing={<ChevronDown className="size-4" strokeWidth={2} />}
              >
                {isAll
                  ? `Yana ${todayQuery.data?.remaining ?? 0} tasini ko‘rish`
                  : 'Yana fanlarni ko‘rish'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
