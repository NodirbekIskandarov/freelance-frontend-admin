import { CheckCircle2, Clock, FileStack, XCircle } from 'lucide-react';
import { Check, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Tabs } from '@/components/ui/Tabs';
import { formatSom } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import { REQUEST_STATUS_LABELS, type RequestStatus } from '@/shared/types/adminFreelance';

import { RejectReasonModal } from './RejectReasonModal';

const statusTones: Record<RequestStatus, BadgeTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={statusTones[status]}>{REQUEST_STATUS_LABELS[status]}</Badge>;
}

const STATUS_TABS = [
  { id: 'all', label: 'Barcha arizalar', icon: FileStack },
  { id: 'pending', label: 'Kutilayotgan arizalar', icon: Clock },
  { id: 'approved', label: 'Tasdiqlangan arizalar', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rad etilgan arizalar', icon: XCircle },
];

/** Uchala arizalar sahifasi bir xil holatga ega. */
interface RequestRow {
  id: string;
  status: RequestStatus;
}

/**
 * Fan arizalari, topshiriq arizalari va shikoyatlar — bir xil ekran:
 * holat filtri, qidiruv, jadval va har qatorda tasdiqlash/rad etish.
 * Uch nusxa yozish o'rniga farq qiladigan qismlari (sarlavha, ustunlar,
 * so'rov hook'lari) tashqaridan beriladi.
 */
export function RequestsShell<T extends RequestRow>({
  title,
  breadcrumbLabel,
  columns,
  useList,
  approve,
  reject,
  rejectTitle,
  rowName,
  summaryLabel,
  emptyMessage,
  extraFilter,
  headerActions,
}: {
  title: string;
  breadcrumbLabel: string;
  columns: Column<T>[];
  useList: (args: {
    page: number;
    page_size: number;
    ordering: string;
    status?: RequestStatus;
    search?: string;
  }) => {
    data?: { results: T[]; count: number; total_pages: number };
    isLoading: boolean;
    isFetching: boolean;
    error?: unknown;
  };
  approve: { run: (id: string) => void; isLoading: boolean; error?: unknown };
  reject: {
    run: (id: string, reason: string) => Promise<boolean>;
    isLoading: boolean;
    error?: unknown;
  };
  rejectTitle: string;
  rowName: (row: T) => string;
  summaryLabel: string;
  emptyMessage: string;
  extraFilter?: ReactNode;
  /** Sarlavha yonidagi tugmalar — masalan "ro'yxatga qaytish". */
  headerActions?: ReactNode;
}) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState<T | null>(null);

  const { data, isLoading, isFetching, error } = useList({
    page,
    page_size: perPage,
    ordering: '-created_at',
    ...(status !== 'all' ? { status: status as RequestStatus } : {}),
    ...(search ? { search } : {}),
  });

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    const ok = await reject.run(rejectTarget.id, reason);
    if (ok) setRejectTarget(null);
  }

  /*
   * Tartib raqami shell'da: u sahifa va sahifa hajmiga bog'liq, ular esa
   * shu yerda. Har bir sahifada alohida yozilsa, 2-sahifada raqamlar
   * yana 1 dan boshlanardi.
   */
  const indexColumn: Column<T> = {
    key: 'index',
    header: '#',
    className: 'w-12 tabular-nums text-fg-dim',
    cell: (_row, index) => (page - 1) * perPage + index + 1,
  };

  const actionColumn: Column<T> = {
    key: 'actions',
    header: 'Amallar',
    align: 'right',
    cell: (row) =>
      row.status === 'pending' ? (
        <span className="flex items-center justify-end gap-2">
          <IconButton
            label={`${rowName(row)} — tasdiqlash`}
            tone="success"
            size="sm"
            disabled={approve.isLoading}
            onClick={() => approve.run(row.id)}
          >
            <Check className="size-4" strokeWidth={2} />
          </IconButton>
          <IconButton
            label={`${rowName(row)} — rad etish`}
            tone="danger"
            size="sm"
            onClick={() => setRejectTarget(row)}
          >
            <X className="size-4" strokeWidth={2} />
          </IconButton>
        </span>
      ) : (
        <span className="text-xs text-fg-muted">Ko&apos;rib chiqilgan</span>
      ),
  };

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: breadcrumbLabel }]}
        actions={headerActions}
      />

      {error !== undefined && error !== null ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          {approve.error !== undefined && approve.error !== null && (
            <div className="mb-4 rounded-card border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
              {getApiErrorMessage(approve.error)}
            </div>
          )}

          {/*
            Holat tanlagichi o'rniga tablar: bu ekranning ASOSIY bo'linishi
            aynan holat bo'yicha va uni ochilib-yopiladigan ro'yxat ortiga
            yashirish qidiruvni ham, filtrni ham bir xil darajaga qo'yardi.
            «Tasdiqlangan» ham qoldirildi — dizaynda uchta tab bor, lekin
            uni olib tashlash mavjud imkoniyatni yo'qotardi.
          */}
          <Tabs
            className="mb-4"
            items={STATUS_TABS}
            active={status}
            onChange={(next) => {
              setStatus(next);
              setPage(1);
            }}
          />

          <section className="flex flex-wrap items-center gap-3">
            {extraFilter}

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
              columns={[indexColumn, ...columns, actionColumn]}
              rows={data?.results ?? []}
              rowKey={(row) => row.id}
              /*
                Skeleton faqat KO'RSATADIGAN narsa bo'lmaganda.

                Sahifa yoki filtr almashsa RTK Query `data`ni bo'shatadi —
                skeleton chiqadi, bu to'g'ri. Mutatsiyadan keyingi fon
                yangilanishida esa `data` joyida qoladi, shuning uchun
                jadval miltillamaydi: foydalanuvchi faqat o'zi tegan
                qatorning yo'qolishini ko'radi.
              */
              isLoading={isLoading || (isFetching && !data)}
              skeletonRows={perPage > 20 ? 20 : perPage}
              emptyMessage={emptyMessage}
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
              summary={data ? `Jami ${formatSom(data.count)} ta ${summaryLabel}` : undefined}
            />
          </Card>
        </>
      )}

      <RejectReasonModal
        open={rejectTarget !== null}
        title={rejectTitle}
        itemName={rejectTarget ? rowName(rejectTarget) : undefined}
        isLoading={reject.isLoading}
        error={reject.error}
        onConfirm={(reason) => void confirmReject(reason)}
        onClose={() => setRejectTarget(null)}
      />
    </>
  );
}
