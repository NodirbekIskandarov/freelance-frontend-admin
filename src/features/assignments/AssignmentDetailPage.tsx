import { ArrowLeft, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { Variant } from '@/shared/types/assignments';

import { AssignmentFormModal } from './AssignmentFormModal';
import { useGetAssignmentQuery, useGetAssignmentVariantsQuery } from './assignmentsApi';

const variantColumns: Column<Variant>[] = [
  {
    key: 'number',
    header: '№',
    className: 'w-16',
    cell: (row) => <span className="tabular-nums text-fg-soft">{row.number}</span>,
  },
  {
    key: 'label',
    header: 'Nomi',
    cell: (row) => <span className="text-fg">{row.label}</span>,
  },
  {
    key: 'request_count',
    header: "So'rovlar",
    align: 'right',
    cell: (row) => <span className="tabular-nums">{row.request_count}</span>,
  },
  {
    key: 'max_published_solutions',
    header: "Maks. e'lon",
    align: 'right',
    cell: (row) => <span className="tabular-nums">{row.max_published_solutions}</span>,
  },
  {
    key: 'is_active',
    header: 'Holat',
    cell: (row) => (
      <Badge tone={row.is_active ? 'success' : 'neutral'}>
        {row.is_active ? 'Faol' : 'Nofaol'}
      </Badge>
    ),
  },
];

export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, error } = useGetAssignmentQuery(id ?? '', { skip: !id });
  const {
    data: variants,
    isLoading: isLoadingVariants,
    error: variantsError,
  } = useGetAssignmentVariantsQuery(id ?? '', { skip: !id });

  if (!id) return <Navigate to="/topshiriqlar" replace />;

  const crumbs = [
    { label: 'Bosh sahifa', to: '/' },
    { label: 'Topshiriqlar', to: '/topshiriqlar' },
    { label: data?.title ?? 'Tafsilot' },
  ];

  if (error) {
    return (
      <>
        <PageHeader title="Topshiriq" breadcrumbs={crumbs} />
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      </>
    );
  }

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Topshiriq" breadcrumbs={crumbs} />
        <div className="h-64 animate-pulse rounded-card bg-elevated" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={data.title}
        breadcrumbs={crumbs}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
              onClick={() => void navigate('/topshiriqlar')}
            >
              Ro&apos;yxatga
            </Button>
            <Button
              icon={<Pencil className="size-4" strokeWidth={1.75} />}
              onClick={() => setEditOpen(true)}
            >
              Tahrirlash
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-fg">Tavsif</h2>
            <Badge tone={data.is_active ? 'success' : 'neutral'}>
              {data.is_active ? 'Faol' : 'Nofaol'}
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-fg-soft">
            {data.description || 'Tavsif kiritilmagan.'}
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-fg">Ma&apos;lumotlar</h2>

          <InfoList className="mt-4">
            <InfoRow label="Fan" value={data.subject_name} />
            <InfoRow label="Universitet" value={data.university_name} />
            <InfoRow label="Yaratilgan" value={formatDateTime(data.created_at)} />
            <InfoRow label="Yangilangan" value={formatDateTime(data.updated_at)} />
          </InfoList>
        </Card>
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-fg">Variantlar</h2>
          <span className="rounded-badge border border-line bg-elevated px-2.5 py-1 text-xs text-fg-muted">
            {variants?.count ?? 0} ta
          </span>
        </div>

        {variantsError ? (
          <p className="p-5 text-sm text-danger">{getApiErrorMessage(variantsError)}</p>
        ) : (
          <Table
            columns={variantColumns}
            rows={variants?.results ?? []}
            rowKey={(row) => row.id}
            isLoading={isLoadingVariants}
            skeletonRows={5}
            emptyMessage="Bu topshiriqda variant yo'q"
          />
        )}
      </Card>

      <AssignmentFormModal open={editOpen} assignment={data} onClose={() => setEditOpen(false)} />
    </>
  );
}
