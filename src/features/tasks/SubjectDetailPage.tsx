import { BookOpen, Ellipsis, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { getApiErrorMessage } from '@/shared/api';
import type { Task } from '@/shared/types/tasks';

import { CreateTaskModal } from './CreateTaskModal';
import { useGetSubjectDetailQuery } from './tasksApi';

const tabs: TabItem[] = [
  { id: 'independent', label: 'Mustaqil ishlar' },
  { id: 'laboratory', label: 'Laboratoriya ishlari' },
  { id: 'practical', label: 'Amaliy ishlar' },
  { id: 'comments', label: 'Izohlar' },
];

export function SubjectDetailPage() {
  const { subjectId = '1' } = useParams();
  const [activeTab, setActiveTab] = useState('independent');
  const [isCreateOpen, setCreateOpen] = useState(false);

  const { data, isLoading, error } = useGetSubjectDetailQuery(subjectId);

  const columns: Column<Task>[] = [
    {
      key: 'order',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (row) => row.order,
    },
    {
      key: 'name',
      header: 'Topshiriq nomi',
      cell: (row) => (
        <span className="block leading-snug">
          <span className="block text-fg">
            {row.order}. {row.name}
          </span>
          <span className="block text-xs text-fg-muted">{row.code}</span>
        </span>
      ),
    },
    {
      key: 'kind',
      header: 'Topshiriq turi',
      cell: (row) => <StatusBadge status={row.kind} />,
    },
    {
      key: 'variantCount',
      header: 'Variantlar soni',
      // Variantsiz topshiriqda son yo'q — dizaynda tire ko'rsatiladi.
      cell: (row) => (row.variantCount === null ? '–' : `${row.variantCount} ta`),
    },
    {
      key: 'solvedCount',
      header: 'Yechilgan variantlar',
      cell: (row) => (row.solvedCount === null ? '–' : `${row.solvedCount} ta`),
    },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-2">
          <IconButton label={`${row.name} — tahrirlash`} size="sm">
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.name} — boshqa amallar`} size="sm">
            <Ellipsis className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
        {getApiErrorMessage(error)}
      </div>
    );
  }

  const rows = data?.tasks[activeTab] ?? [];
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? '';

  return (
    <>
      <PageHeader
        className="mb-4"
        breadcrumbsPosition="above"
        breadcrumbs={[
          { label: 'Bosh sahifa', to: '/' },
          { label: 'Institutlar', to: '/institutlar' },
          { label: data?.instituteShort ?? 'TATU', to: '/institutlar' },
          { label: 'Fanlar', to: '/topshiriqlar' },
          { label: data?.name ?? '' },
        ]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <BookOpen className="size-6" strokeWidth={1.75} />
            </span>
            {data?.name ?? '—'}
            {data && <Badge tone="success">{data.code}</Badge>}
          </span>
        }
        subtitle={data?.instituteName}
        actions={
          <Button
            icon={<Plus className="size-4" strokeWidth={2} />}
            onClick={() => setCreateOpen(true)}
          >
            Yangi topshiriq qo‘shish
          </Button>
        }
      />

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} className="mb-4" />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 px-5 pt-5 pb-1">
          <h2 className="text-base font-semibold text-fg">{activeLabel}</h2>
          <Badge tone="success">{rows.length} ta</Badge>
        </div>

        <div className="mt-4">
          <Table
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            skeletonRows={10}
            density="compact"
            emptyMessage={`«${activeLabel}» bo‘limida hali topshiriq yo‘q`}
          />
        </div>
      </Card>

      <CreateTaskModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        subjectName={data ? `${data.name} (${data.code})` : ''}
        instituteName={data?.instituteName ?? ''}
      />
    </>
  );
}
