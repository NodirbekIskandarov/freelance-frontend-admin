import { Archive, ArrowLeft, Check, Download, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDateTime, formatDecimalSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import type { Solution } from '@/shared/types/solutions';

import { PublishModal } from './PublishModal';
import { RejectModal } from './RejectModal';
import { SolutionStatusBadge } from './SolutionStatusBadge';
import {
  useApproveSolutionMutation,
  useArchiveSolutionMutation,
  useGetSolutionQuery,
} from './solutionsApi';

/**
 * Qaysi amal qaysi holatda mumkinligi — bitta joyda.
 *
 * Backend baribir tekshiradi, lekin bosib bo'lmaydigan tugmani
 * ko'rsatib qo'yish moderatorni 400 xatosiga olib borardi: masalan
 * allaqachon e'lon qilingan yechimni qayta tasdiqlash.
 */
function allowedActions(status: Solution['status']) {
  return {
    approve: status === 'pending',
    reject: status === 'pending',
    publish: status === 'approved',
    archive: status === 'published',
  };
}

export function SolutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [publishOpen, setPublishOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data, isLoading, error } = useGetSolutionQuery(id ?? '', { skip: !id });
  const [approve, { isLoading: isApproving, error: approveError }] = useApproveSolutionMutation();
  const [archive, { isLoading: isArchiving, error: archiveError }] = useArchiveSolutionMutation();

  if (!id) return <Navigate to="/yechimlar" replace />;

  const actionError = approveError ?? archiveError;

  if (error) {
    return (
      <>
        <PageHeader title="Yechim" breadcrumbs={crumbs()} />
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      </>
    );
  }

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Yechim" breadcrumbs={crumbs()} />
        <div className="h-64 animate-pulse rounded-card bg-elevated" />
      </>
    );
  }

  const can = allowedActions(data.status);

  return (
    <>
      <PageHeader
        title={data.title}
        breadcrumbs={crumbs(data.title)}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
              onClick={() => void navigate('/yechimlar')}
            >
              Ro&apos;yxatga
            </Button>

            {can.reject && (
              <Button
                variant="danger"
                icon={<X className="size-4" strokeWidth={2} />}
                onClick={() => setRejectOpen(true)}
              >
                Rad etish
              </Button>
            )}

            {can.approve && (
              <Button
                variant="success"
                icon={<Check className="size-4" strokeWidth={2} />}
                disabled={isApproving}
                onClick={() => void approve(id)}
              >
                {isApproving ? 'Yuborilmoqda…' : 'Tasdiqlash'}
              </Button>
            )}

            {can.publish && (
              <Button
                icon={<Send className="size-4" strokeWidth={1.75} />}
                onClick={() => setPublishOpen(true)}
              >
                E&apos;lon qilish
              </Button>
            )}

            {can.archive && (
              <Button
                variant="secondary"
                icon={<Archive className="size-4" strokeWidth={1.75} />}
                disabled={isArchiving}
                onClick={() => void archive(id)}
              >
                {isArchiving ? 'Yuborilmoqda…' : 'Arxivlash'}
              </Button>
            )}
          </>
        }
      />

      {actionError && (
        <div className="mb-4 rounded-card border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
          {getApiErrorMessage(actionError)}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-fg">Tavsif</h2>
            <SolutionStatusBadge status={data.status} />
          </div>

          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-fg-soft">
            {data.description || 'Tavsif kiritilmagan.'}
          </p>

          {data.status === 'rejected' && data.reject_reason && (
            <div className="mt-5 rounded-control border border-danger/25 bg-danger/10 px-4 py-3">
              <p className="text-xs font-medium text-danger">Rad etish sababi</p>
              <p className="mt-1 text-sm text-fg-soft">{data.reject_reason}</p>
            </div>
          )}

          {data.file && (
            <div className="mt-5">
              <a
                href={data.file}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-control border border-line bg-card px-4 text-sm font-medium text-fg-soft transition-colors hover:bg-elevated hover:text-fg"
              >
                <Download className="size-4" strokeWidth={1.75} />
                Faylni yuklab olish
              </a>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-fg">Ma&apos;lumotlar</h2>

          <InfoList className="mt-4">
            <InfoRow label="Variant" value={data.variant_label} />
            <InfoRow label="Narx" value={formatDecimalSom(data.price)} />
            <InfoRow
              label="Komissiya"
              value={data.commission_percent === null ? '—' : `${data.commission_percent}%`}
            />
            <InfoRow label="Yuborilgan" value={formatDateTime(data.created_at)} />
            <InfoRow label="Yangilangan" value={formatDateTime(data.updated_at)} />
            <InfoRow label="E'lon qilingan" value={formatDateTime(data.published_at)} />
            <InfoRow
              label="Muallif ID"
              value={<span className="font-mono text-xs break-all">{data.uploader}</span>}
            />
            <InfoRow
              label="Moderator ID"
              value={
                data.moderated_by ? (
                  <span className="font-mono text-xs break-all">{data.moderated_by}</span>
                ) : (
                  '—'
                )
              }
            />
          </InfoList>
        </Card>
      </div>

      <PublishModal
        solutionId={id}
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onPublished={() => void navigate('/yechimlar')}
      />

      <RejectModal
        solutionId={id}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onRejected={() => void navigate('/yechimlar')}
      />
    </>
  );
}

function crumbs(title?: string) {
  return [
    { label: 'Bosh sahifa', to: '/' },
    { label: 'Yechimlar', to: '/yechimlar' },
    { label: title ?? 'Tafsilot' },
  ];
}
