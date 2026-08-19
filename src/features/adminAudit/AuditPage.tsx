import { useState } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { AUDIT_ACTION_GROUPS, type AuditAction, type AuditLog } from '@/shared/types/adminAudit';

import { useGetAuditLogsQuery } from './adminAuditApi';

/**
 * Amal rangi guruh bo'yicha: tasdiqlash yashil, rad etish/o'chirish
 * qizil, pul harakati sariq, qolgani neytral. 36 ta amalga alohida
 * rang berish o'rniga naqsh bo'yicha aniqlanadi.
 */
function toneFor(action: AuditAction): BadgeTone {
  if (/_rejected$|_deleted$|_suspended$|_frozen$/.test(action)) return 'danger';
  if (/_approved$|_published$|_reinstated$|_paid$|_unfrozen$/.test(action)) return 'success';
  if (/^wallet_|^withdrawal_|_refunded$/.test(action)) return 'warning';
  if (/_created$/.test(action)) return 'info';
  return 'neutral';
}

const actionOptions = [
  { value: 'all', label: 'Barcha amallar' },
  ...AUDIT_ACTION_GROUPS.flatMap((group) =>
    group.actions.map((action) => ({ value: action, label: `${group.label}: ${action}` })),
  ),
];

/** Backend `changes`ni erkin shaklda qaytaradi — o'qiladigan qatorga aylantiramiz. */
function summarizeChanges(changes: unknown): string {
  if (changes === null || changes === undefined) return '';
  if (typeof changes === 'string') return changes;
  if (typeof changes !== 'object') return String(changes);

  const entries = Object.entries(changes as Record<string, unknown>);
  if (entries.length === 0) return '';

  return entries
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(', ');
}

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [action, setAction] = useState('all');
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetAuditLogsQuery({
    page,
    page_size: perPage,
    ordering: '-created_at',
    ...(action !== 'all' ? { action: action as AuditAction } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'created_at',
      header: 'Vaqt',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'actor',
      header: 'Kim',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg">{row.actor_label || 'Tizim'}</span>
      ),
    },
    {
      key: 'action',
      header: 'Amal',
      cell: (row) => <Badge tone={toneFor(row.action)}>{row.action_display}</Badge>,
    },
    {
      key: 'target',
      header: 'Nimaga',
      className: 'max-w-[260px]',
      cell: (row) => (
        <span className="block">
          <span className="block truncate text-fg-soft" title={row.target_label}>
            {row.target_label || '—'}
          </span>
          {row.target_type && (
            <span className="block text-xs text-fg-muted">{row.target_type}</span>
          )}
        </span>
      ),
    },
    {
      key: 'reason',
      header: "Sabab / o'zgarish",
      className: 'max-w-[280px]',
      cell: (row) => {
        const changes = summarizeChanges(row.changes);
        const text = row.reason || changes;

        return (
          <span className="block truncate text-fg-muted" title={text}>
            {text || '—'}
          </span>
        );
      },
    },
    {
      key: 'ip',
      header: 'IP',
      cell: (row) => (
        <span className="font-mono text-xs whitespace-nowrap text-fg-muted">
          {row.ip_address || '—'}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit jurnali"
        subtitle="Adminlar bajargan har bir amal shu yerda qayd etiladi."
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Audit jurnali' }]}
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Amal bo'yicha filtr"
              options={actionOptions}
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
              className="w-72"
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
              isLoading={isLoading || isFetching}
              skeletonRows={perPage > 20 ? 20 : perPage}
              density="compact"
              emptyMessage="Yozuv topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta yozuv` : undefined}
            />
          </Card>
        </>
      )}
    </>
  );
}
