import { CircleCheck, Clock, Inbox, LifeBuoy, Paperclip, Reply, UserCheck } from 'lucide-react';
import { useState } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import {
  APPEAL_STATUS_LABELS,
  APPEAL_STATUSES,
  APPEAL_TOPIC_LABELS,
  APPEAL_TOPICS,
  type AdminAppeal,
  type AppealStatus,
  type AppealTopic,
} from '@/shared/types/adminAppeals';

import { ReplyModal } from './ReplyModal';
import {
  useGetAppealsQuery,
  useGetAppealStatsQuery,
  useTakeAppealMutation,
} from './adminAppealsApi';

const statusTones: Record<AppealStatus, BadgeTone> = {
  open: 'warning',
  in_review: 'info',
  resolved: 'success',
};

const statusOptions = [
  { value: 'all', label: 'Barcha holatlar' },
  ...APPEAL_STATUSES.map((value) => ({ value, label: APPEAL_STATUS_LABELS[value] })),
];

const topicOptions = [
  { value: 'all', label: 'Barcha mavzular' },
  ...APPEAL_TOPICS.map((value) => ({ value, label: APPEAL_TOPIC_LABELS[value] })),
];

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ru-RU').slice(0, 16);
}

export function AppealsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState('all');
  const [topic, setTopic] = useState('all');
  const [search, setSearch] = useState('');
  const [replyTarget, setReplyTarget] = useState<AdminAppeal | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data: stats } = useGetAppealStatsQuery();
  const { data, isLoading, isFetching, error } = useGetAppealsQuery({
    page,
    page_size: perPage,
    ordering: '-created_at',
    ...(status !== 'all' ? { status: status as AppealStatus } : {}),
    ...(topic !== 'all' ? { topic: topic as AppealTopic } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [take, takeState] = useTakeAppealMutation();

  const columns: Column<AdminAppeal>[] = [
    {
      key: 'subject',
      header: 'Murojaat',
      className: 'max-w-[320px]',
      cell: (row) => (
        <span className="block">
          <span className="flex items-center gap-1.5">
            <span className="min-w-0 truncate font-medium text-fg" title={row.subject}>
              {row.subject}
            </span>
            {/* Skrinshot borligi navbatda KO'RINADI: fayl biriktirilgan
                murojaat odatda tezroq hal bo'ladi va operator qaysi
                birini oldin ochishini shundan biladi. */}
            {row.attachments.length > 0 && (
              <span
                className="flex shrink-0 items-center gap-0.5 text-xs text-fg-muted"
                title={`${row.attachments.length} ta fayl`}
              >
                <Paperclip className="size-3" strokeWidth={1.75} />
                {row.attachments.length}
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-fg-muted" title={row.message}>
            {row.message}
          </span>
        </span>
      ),
    },
    {
      key: 'user',
      header: 'Foydalanuvchi',
      cell: (row) => (
        <span className="block whitespace-nowrap">
          <span className="block text-fg">{row.user.full_name || '—'}</span>
          <span className="block text-xs text-fg-muted">{row.user.phone}</span>
        </span>
      ),
    },
    {
      key: 'topic',
      header: 'Mavzu',
      cell: (row) => <Badge tone="neutral">{APPEAL_TOPIC_LABELS[row.topic]}</Badge>,
    },
    {
      key: 'reference',
      header: 'Raqam',
      cell: (row) => <span className="font-mono text-xs text-fg-muted">{row.reference}</span>,
    },
    {
      key: 'created_at',
      header: 'Sana',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <span className="flex flex-col items-start gap-1">
          <Badge tone={statusTones[row.status]}>{APPEAL_STATUS_LABELS[row.status]}</Badge>
          {row.replied_by && (
            <span className="text-xs text-fg-muted">{row.replied_by.full_name}</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          {/* "Olish" faqat hali hech kim tegmagan murojaatda ma'noli. */}
          {row.status === 'open' && (
            <IconButton
              label="O'z zimmamga olish"
              tone="info"
              size="sm"
              disabled={takeState.isLoading}
              onClick={() => void take(row.id)}
            >
              <UserCheck className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
          {row.status !== 'resolved' && (
            <IconButton
              label="Javob yozish"
              tone="success"
              size="sm"
              onClick={() => setReplyTarget(row)}
            >
              <Reply className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Murojaatlar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Murojaatlar' }]}
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          {takeState.error !== undefined && takeState.error !== null && (
            <div className="mb-4 rounded-card border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
              {getApiErrorMessage(takeState.error)}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami"
              value={stats ? formatSom(stats.total) : '—'}
              icon={LifeBuoy}
              tone="info"
            />
            <StatCard
              label="Yangi"
              value={stats ? formatSom(stats.open) : '—'}
              icon={Inbox}
              tone="warning"
            />
            <StatCard
              label="Ko'rib chiqilmoqda"
              value={stats ? formatSom(stats.in_review) : '—'}
              icon={Clock}
              tone="purple"
            />
            <StatCard
              label="Hal qilindi"
              value={stats ? formatSom(stats.resolved) : '—'}
              icon={CircleCheck}
              tone="success"
            />
          </section>

          <section className="mt-4 flex flex-wrap items-center gap-3">
            <Select
              aria-label="Holat bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="w-48"
            />
            <Select
              aria-label="Mavzu bo'yicha filtr"
              options={topicOptions}
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setPage(1);
              }}
              className="w-48"
            />

            <div className="ml-auto">
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-72"
              />
            </div>
          </section>

          <Card className="mt-4 overflow-hidden">
            <Table
              columns={columns}
              rows={data?.results ?? []}
              rowKey={(row) => row.id}
              /*
                Skeleton faqat ko'rsatadigan narsa bo'lmaganda: sahifa yoki
                filtr almashsa `data` bo'shaydi, mutatsiyadan keyingi fon
                yangilanishida esa joyida qoladi va jadval miltillamaydi.
              */
              isLoading={isLoading || (isFetching && !data)}
              skeletonRows={perPage > 20 ? 20 : perPage}
              density="compact"
              emptyMessage="Bunday murojaat topilmadi"
            />

            <Pagination
              page={page}
              totalPages={data?.total_pages ?? 1}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              summary={data ? `Jami ${formatSom(data.count)} ta murojaat` : undefined}
            />
          </Card>
        </>
      )}

      <ReplyModal appeal={replyTarget} onClose={() => setReplyTarget(null)} />
    </>
  );
}
