import {
  Check,
  ChevronRight,
  Download,
  Ellipsis,
  Eye,
  FileText,
  Minus,
  Plus,
  Printer,
  RotateCw,
  ScanLine,
} from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { cn } from '@/lib/cn';
import { getApiErrorMessage } from '@/shared/api';
import type { SubmissionDetailResponse, SubmittedAnswer } from '@/shared/types/submissions';

import { useGetSubmissionDetailQuery } from './submissionsApi';

/**
 * PDF ko'ruvchi (16-rasm).
 *
 * Haqiqiy PDF render qilinmaydi — dizaynda hujjatning ichki matni ko'rinadi,
 * shuning uchun bu yerda o'sha matn oq varaq ustida chiziladi. Backend
 * haqiqiy fayl bergach, bu blok `<iframe>` yoki pdf.js bilan almashtiriladi.
 */
function DocumentViewer({ current }: { current: SubmissionDetailResponse['current'] }) {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="mt-4 overflow-hidden rounded-card border border-line bg-canvas">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2.5">
        <FileText className="size-4 shrink-0 text-fg-muted" strokeWidth={1.75} />
        <span className="min-w-0 flex-1 truncate text-[13px] text-fg-soft">{current.fileName}</span>

        <span className="text-[13px] text-fg-muted">1 / {current.pageCount}</span>

        <span className="flex items-center gap-1">
          <IconButton
            label="Kichraytirish"
            size="sm"
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
          >
            <Minus className="size-4" strokeWidth={2} />
          </IconButton>
          <span className="w-12 text-center text-[13px] text-fg-soft">{zoom}%</span>
          <IconButton
            label="Kattalashtirish"
            size="sm"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
          >
            <Plus className="size-4" strokeWidth={2} />
          </IconButton>
        </span>

        <span className="flex items-center gap-1">
          <IconButton label="Moslashtirish" size="sm">
            <ScanLine className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Aylantirish" size="sm">
            <RotateCw className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Yuklab olish" size="sm">
            <Download className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Chop etish" size="sm">
            <Printer className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label="Boshqa amallar" size="sm">
            <Ellipsis className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      </div>

      <div className="flex justify-center bg-[#2a2f36] px-6 py-6">
        <div
          className="w-full max-w-[640px] bg-white px-10 py-8 text-black shadow-modal"
          style={{ fontSize: `${zoom / 100}rem` }}
        >
          <p className="text-center text-[0.95em] font-bold">{current.subject}</p>
          <p className="text-center text-[0.95em] font-bold">{current.type}</p>
          <p className="mb-4 text-center text-[0.95em] font-bold">
            {current.title.split(' ').at(-1)}
          </p>

          <ol className="list-decimal space-y-1.5 pl-5 text-[0.8em] leading-relaxed">
            {current.previewLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

const answerTabs = (data?: SubmissionDetailResponse): TabItem[] => [
  {
    id: 'Yangi',
    label: 'Yangi javoblar',
    count: data?.answers.filter((item) => item.status === 'Yangi').length ?? 0,
  },
  {
    id: 'Tasdiqlangan',
    label: 'Tasdiqlanganlar',
    count: data?.answers.filter((item) => item.status === 'Tasdiqlangan').length ?? 0,
  },
  {
    id: 'Arxivlangan',
    label: 'Arxivlanganlar',
    count: data?.answers.filter((item) => item.status === 'Arxivlangan').length ?? 0,
  },
];

export function SubmissionDetailPage() {
  const { subjectId = '1' } = useParams();
  const [activeTab, setActiveTab] = useState('Yangi');
  const [selectedVariant, setSelectedVariant] = useState('5');

  const { data, isLoading, error } = useGetSubmissionDetailQuery(subjectId);

  const columns: Column<SubmittedAnswer>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-10 text-fg-dim',
      cell: (_row, index) => index + 1,
    },
    {
      key: 'submittedAt',
      header: 'Yuborilgan sana',
      cell: (row) => <span className="whitespace-nowrap">{row.submittedAt}</span>,
    },
    {
      key: 'sender',
      header: 'Yuboruvchi',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar
            name={row.sender.username.replace('@', '')}
            src={row.sender.avatarUrl}
            size="sm"
          />
          <span className="min-w-0 leading-snug">
            <span className="block whitespace-nowrap text-fg">{row.sender.username}</span>
            <Badge tone="info" className="mt-0.5 text-[10px]">
              {row.sender.role}
            </Badge>
          </span>
        </span>
      ),
    },
    {
      key: 'file',
      header: 'Fayl',
      cell: (row) => (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <FileText className="size-4 shrink-0 text-success" strokeWidth={1.75} />
          {row.fileName}
        </span>
      ),
    },
    { key: 'size', header: 'Hajmi', cell: (row) => row.size },
    {
      key: 'comment',
      header: 'Izoh',
      className: 'max-w-[180px]',
      cell: (row) => <span className="block leading-snug text-fg-muted">{row.comment}</span>,
    },
    { key: 'status', header: 'Holat', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Amallar',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <IconButton label={`${row.fileName} — ko'rish`} size="sm">
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton label={`${row.fileName} — yuklab olish`} size="sm">
            <Download className="size-4" strokeWidth={1.75} />
          </IconButton>

          {/* Tasdiqlash faqat hali qaralmagan javobda. */}
          {row.status === 'Yangi' && (
            <IconButton label={`${row.fileName} — tasdiqlash`} tone="success" size="sm">
              <Check className="size-4" strokeWidth={2} />
            </IconButton>
          )}
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

  const rows = data?.answers.filter((item) => item.status === activeTab) ?? [];
  const variantLabel = data?.variants.find((item) => item.id === selectedVariant)?.label ?? '';

  return (
    <>
      <PageHeader
        className="mb-4"
        breadcrumbsPosition="above"
        breadcrumbs={[
          { label: 'Bosh sahifa', to: '/' },
          { label: 'Yuborilgan javoblar', to: '/yuborilgan/javoblar' },
          { label: data?.instituteShort ?? 'TATU', to: '/yuborilgan/javoblar' },
          { label: data?.subjectName ?? '' },
        ]}
        title=""
      />

      <div className="flex flex-col gap-4 xl:flex-row">
        {/* Chapdagi topshiriqlar ro'yxati */}
        <Card className="flex w-full flex-col p-5 xl:w-[320px] xl:shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-fg">{data?.subjectName ?? '—'}</h2>
            <Badge tone="success">Jami topshiriqlar: {data?.totalTasks ?? 0}</Badge>
          </div>

          <SearchInput className="mt-4" />

          <div className="mt-4 flex flex-col gap-1.5">
            {(data?.tasks ?? []).map((task, index) => (
              <button
                key={task.id}
                type="button"
                className={cn(
                  'flex items-start gap-2.5 rounded-card border p-3 text-left transition-colors',
                  index === 0
                    ? 'border-primary/50 bg-primary/8'
                    : 'border-line bg-canvas hover:bg-elevated',
                )}
              >
                <FileText
                  className={cn(
                    'mt-0.5 size-4 shrink-0',
                    index === 0 ? 'text-primary' : 'text-fg-muted',
                  )}
                  strokeWidth={1.75}
                />
                <span className="min-w-0 leading-snug">
                  <span className={cn('block text-sm', index === 0 ? 'text-primary' : 'text-fg')}>
                    {task.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-muted">
                    {task.answerCount} ta javob
                  </span>
                </span>
              </button>
            ))}
          </div>

          <Button variant="secondary" className="mt-4 self-start">
            Yana yuklash
          </Button>
        </Card>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="flex flex-wrap items-center gap-3 text-lg font-semibold text-fg">
                  {data?.current.title ?? '—'}
                  {data && <Badge tone="neutral">{data.current.type}</Badge>}
                </h2>

                {data && (
                  <p className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-fg-muted">
                    <span>Kurs: {data.current.course}</span>
                    <span>Fan: {data.current.subject}</span>
                    <span>Yuklangan sana: {data.current.uploadedAt}</span>
                    <span>
                      Yuklovchi: <span className="text-primary">{data.current.uploader}</span>
                    </span>
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="secondary"
                  icon={<Download className="size-4" strokeWidth={1.75} />}
                >
                  Yuklab olish
                </Button>
                <IconButton label="Boshqa amallar" size="lg">
                  <Ellipsis className="size-4" strokeWidth={1.75} />
                </IconButton>
              </div>
            </div>

            {isLoading || !data ? (
              <div className="mt-4 h-72 animate-pulse rounded-card bg-elevated" />
            ) : (
              <DocumentViewer current={data.current} />
            )}
          </Card>

          {/* Variantlar tasmasi */}
          <Card className="p-5">
            <h3 className="text-base font-semibold text-fg">Variantlar</h3>

            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
              {(data?.variants ?? []).map((variant) => {
                const isSelected = variant.id === selectedVariant;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'shrink-0 rounded-card border px-5 py-2.5 text-center transition-colors',
                      isSelected
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-line bg-canvas hover:bg-elevated',
                    )}
                  >
                    <span
                      className={cn(
                        'block text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-fg',
                      )}
                    >
                      {variant.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-fg-muted">
                      {variant.answerCount} javob
                    </span>
                  </button>
                );
              })}

              <IconButton label="Keyingi variantlar" size="lg" className="shrink-0">
                <ChevronRight className="size-4" strokeWidth={2} />
              </IconButton>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 pt-5">
              <h3 className="text-base font-semibold text-fg">
                {variantLabel} uchun yuborilgan javoblar
              </h3>
              <Badge tone="success">{data?.answers.length ?? 0} ta javob</Badge>
            </div>

            <Tabs
              items={answerTabs(data)}
              active={activeTab}
              onChange={setActiveTab}
              className="mt-4 px-2"
            />

            <Table
              columns={columns}
              rows={rows}
              rowKey={(row) => row.id}
              isLoading={isLoading}
              skeletonRows={5}
              density="compact"
              emptyMessage="Bu bo‘limda javob yo‘q"
            />
          </Card>
        </div>
      </div>
    </>
  );
}
