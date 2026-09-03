import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { SubjectCategory } from '@/shared/types/catalogue';

import { useDeleteSubjectCategoryMutation, useGetSubjectCategoriesQuery } from './catalogueApi';
import { DeleteCatalogueModal } from './DeleteCatalogueModal';
import { SubjectCategoryFormModal } from './SubjectCategoryFormModal';

/**
 * «Fan toifalari» — fanlarning global tasnifi.
 *
 * Bu universitetning yo'nalishi EMAS. Yo'nalish bitta fakultetga tegishli
 * va shuning uchun «Dasturiy injiniring» har institutda alohida qator
 * bo'lardi; toifa esa butun katalog uchun bitta. Aynan shu sabab bo'lim
 * institutlar ostida emas, alohida turadi.
 */
export function SubjectCategoriesPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SubjectCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SubjectCategory | null>(null);

  const { data, isLoading, isFetching, error } = useGetSubjectCategoriesQuery({
    page,
    page_size: perPage,
    ordering: 'position',
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [deleteCategory, deleteState] = useDeleteSubjectCategoryMutation();

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      await deleteCategory(deleteTarget.id).unwrap();
    } catch {
      return;
    }

    setDeleteTarget(null);
  }

  const columns: Column<SubjectCategory>[] = [
    {
      key: 'index',
      header: '#',
      className: 'w-12 tabular-nums text-fg-dim',
      cell: (_row, index) => (page - 1) * perPage + index + 1,
    },
    {
      key: 'name',
      header: 'Toifa',
      primary: true,
      cell: (row) => (
        <span className="block">
          <span className="block font-medium text-fg">{row.name_uz || row.name}</span>
          {/* Ruscha nom ham ko'rinadi: u bo'lmasa rus tilida filtr bo'sh
              chiqadi va buni ro'yxatga qaramasdan bilib bo'lmasdi. */}
          <span className="block text-xs text-fg-muted">{row.name_ru || '— ruscha nomi yo‘q'}</span>
        </span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      hideOnMobile: true,
      cell: (row) => <span className="font-mono text-xs text-fg-muted">{row.slug}</span>,
    },
    {
      key: 'subject_count',
      header: 'Fanlar',
      align: 'right',
      cell: (row) => (
        <span className="text-fg-soft tabular-nums">{formatSom(row.subject_count ?? 0)}</span>
      ),
    },
    {
      key: 'position',
      header: 'Tartib',
      align: 'right',
      hideOnMobile: true,
      cell: (row) => <span className="text-fg-muted tabular-nums">{row.position}</span>,
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
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      sticky: true,
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          <IconButton
            label={`${row.name} — tahrirlash`}
            size="sm"
            onClick={() => {
              setEditTarget(row);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>
          <IconButton
            label={`${row.name} — o'chirish`}
            tone="danger"
            size="sm"
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="size-4" strokeWidth={1.75} />
          </IconButton>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Fan toifalari"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Fan toifalari' }]}
        actions={
          <Button
            icon={<Plus className="size-4" strokeWidth={2} />}
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            Yangi toifa
          </Button>
        }
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          <p className="mb-4 max-w-2xl text-sm text-fg-muted">
            Toifa — fanning sohasi va u BUTUN katalog uchun bitta. Institutning yo&apos;nalishi
            bilan aralashtirmang: yo&apos;nalish bitta fakultetga tegishli, toifa esa qayerda
            o&apos;qitilishidan qat&apos;i nazar bir xil.
          </p>

          <section className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-72"
            />
          </section>

          <Card className="mt-4 overflow-hidden">
            <Table
              columns={columns}
              rows={data?.results ?? []}
              rowKey={(row) => row.id}
              isLoading={isLoading || (isFetching && !data)}
              skeletonRows={perPage > 20 ? 20 : perPage}
              emptyMessage="Toifa topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta toifa` : undefined}
            />
          </Card>
        </>
      )}

      <SubjectCategoryFormModal
        open={formOpen}
        category={editTarget}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
      />

      <DeleteCatalogueModal
        title="Toifani o'chirish"
        itemName={deleteTarget?.name ?? null}
        /* Fanlar o'chmasligini OCHIQ aytamiz: «o'chirish» so'zi ortida
           nima turganini bilmasdan tugmani bosish qo'rqinchli. */
        description={
          deleteTarget && (deleteTarget.subject_count ?? 0) > 0
            ? `Bu toifada ${deleteTarget.subject_count} ta fan bor. Ular o'chmaydi — shunchaki toifasiz qoladi.`
            : 'Toifa ro‘yxatdan olib tashlanadi. Fanlar o‘chmaydi.'
        }
        isLoading={deleteState.isLoading}
        error={deleteState.error}
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
