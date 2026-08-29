import { MessageSquare, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Link } from '@/i18n/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useGetUniversitiesQuery } from '@/features/catalogue/catalogueApi';
import { getApiErrorMessage } from '@/shared/api';
import type { AdminComment } from '@/shared/types/comments';

import { DeleteCommentModal } from './DeleteCommentModal';
import { useDeleteCommentMutation, useGetCommentsQuery } from './commentsApi';

export function CommentsPage() {
  /*
   * `?assignment=` — topshiriq tafsilotidagi «hammasini ko'rish»
   * havolasidan keladi. Filtr manzilda, holatda emas: havola shu bilan
   * ishlaydi va sahifani yangilash uni yo'qotmaydi.
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const assignmentParam = searchParams.get('assignment');

  const [university, setUniversity] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  /* `null` — o'chirish oynasi yopiq. */
  const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const universities = useGetUniversitiesQuery({ page_size: 100, ordering: 'short_name' });

  const { data, isLoading, isFetching, error } = useGetCommentsQuery({
    page,
    page_size: perPage,
    ...(assignmentParam ? { assignment: assignmentParam } : {}),
    ...(university !== 'all' ? { assignment__subject__university: university } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  function clearAssignmentFilter() {
    const params = new URLSearchParams(searchParams);
    params.delete('assignment');
    setSearchParams(params, { replace: true });
    setPage(1);
  }

  const [remove, removeState] = useDeleteCommentMutation();

  const universityOptions = [
    { value: 'all', label: 'Barcha institutlar' },
    ...(universities.data?.results ?? []).map((item) => ({
      value: item.id,
      label: item.short_name || item.name,
    })),
  ];

  const columns: Column<AdminComment>[] = [
    {
      key: 'author',
      header: 'Muallif',
      className: 'max-w-[180px]',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar name={row.author?.full_name || '?'} size="sm" />
          <span className="min-w-0 leading-snug">
            <span className="block truncate text-fg">
              {row.author?.full_name?.trim() || 'Foydalanuvchi'}
            </span>
            <span className="block text-xs whitespace-nowrap text-fg-muted">
              {formatDateTime(row.created_at)}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'body',
      header: 'Izoh',
      /*
        Eng keng ustun: moderatorning asosiy ishi matnni o'qish. Uch
        qatordan keyin qirqiladi, to'liq matn `title` da — uzun izoh
        jadvalni cho'zib, qolgan qatorlarni ekrandan chiqarardi.
      */
      className: 'min-w-[280px]',
      cell: (row) => (
        <span className="line-clamp-3 text-[13px] leading-relaxed text-fg-soft" title={row.body}>
          {row.body}
        </span>
      ),
    },
    {
      key: 'assignment',
      header: 'Topshiriq',
      className: 'max-w-[220px]',
      /*
        Nomi havola: moderator izohni o'qib, u nima haqida ekanini
        tushunish uchun topshiriqqa qarashi kerak bo'ladi. Havolasiz uni
        boshqa bo'limdan qidirib topishga majbur bo'lardi.
      */
      cell: (row) => (
        <span className="block leading-snug">
          <Link
            to={`/topshiriqlar/${row.assignment}`}
            className="block truncate text-fg transition-colors hover:text-primary hover:underline"
            title={row.assignment_title}
          >
            {row.assignment_title}
          </Link>
          <span className="block truncate text-xs text-fg-muted">
            {row.subject_name} · {row.university_name}
          </span>
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
        <IconButton
          label="Izohni o'chirish"
          size="sm"
          tone="danger"
          onClick={() => setDeleteTarget(row)}
        >
          <Trash2 className="size-4" strokeWidth={1.75} />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbsPosition="above"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Izohlar' }]}
        title="Topshiriq izohlari"
        subtitle="Izohlar saytda darrov ko'rinadi — bu yerda nomaqbulini olib tashlanadi."
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
              <MessageSquare className="size-4 text-primary" strokeWidth={1.75} />
              Izohlar
              <span className="rounded-badge border border-line bg-elevated px-2.5 py-1 text-xs text-fg-muted">
                {data?.count ?? 0} ta
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {/*
                Bitta topshiriq bo'yicha filtr yoqilganini ochiq aytish
                kerak: aks holda ro'yxat sababsiz qisqargandek ko'rinardi
                va moderator qolgan izohlar qayoqqa ketdi deb o'ylardi.
              */}
              {assignmentParam && (
                <button
                  type="button"
                  onClick={clearAssignmentFilter}
                  className="inline-flex h-9 items-center gap-1.5 rounded-control border border-primary/40 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                >
                  Bitta topshiriq bo&apos;yicha
                  <X className="size-3.5" strokeWidth={2} />
                </button>
              )}

              <Select
                aria-label="Institut bo'yicha filtr"
                options={universityOptions}
                value={university}
                onChange={(event) => {
                  setUniversity(event.target.value);
                  setPage(1);
                }}
                searchable={universityOptions.length > 8}
                searchPlaceholder="Institut nomi..."
                className="w-56"
              />
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Izoh matni yoki topshiriq..."
                className="w-64"
              />
            </div>
          </div>

          <div className="mt-4">
            <Table
              columns={columns}
              rows={data?.results ?? []}
              rowKey={(row) => row.id}
              isLoading={isLoading || isFetching}
              skeletonRows={8}
              emptyMessage="Izoh topilmadi"
            />
          </div>

          <Pagination
            page={page}
            totalPages={data?.total_pages ?? 1}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={(value) => {
              setPerPage(value);
              setPage(1);
            }}
          />
        </Card>
      )}

      <DeleteCommentModal
        comment={deleteTarget}
        isLoading={removeState.isLoading}
        error={removeState.error}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;

          try {
            await remove(deleteTarget.id).unwrap();
          } catch {
            return;
          }

          setDeleteTarget(null);
        }}
      />
    </>
  );
}
