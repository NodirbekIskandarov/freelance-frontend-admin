import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DateCell } from '@/components/ui/Cells';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { RowActions } from '@/components/ui/RowActions';
import { Table, type Column } from '@/components/ui/Table';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import type { Role } from '@/shared/types/adminRoles';

import { RoleFormModal } from './RoleFormModal';
import { useDeleteRoleMutation, useGetRolesQuery } from './adminRolesApi';

export function RolesPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Role | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetRolesQuery({
    page,
    page_size: perPage,
    ordering: 'name',
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const [deleteRole, deleteState] = useDeleteRoleMutation();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(role: Role) {
    setEditing(role);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await deleteRole(deleting.id).unwrap();
    } catch {
      return;
    }

    setDeleting(null);
  }

  const columns: Column<Role>[] = [
    {
      key: 'name',
      header: 'Rol',
      className: 'max-w-[280px]',
      cell: (row) => (
        <span className="block">
          <span className="flex items-center gap-2">
            <span className="font-medium text-fg">{row.name}</span>
            {row.is_system && <Badge tone="info">Tizim</Badge>}
          </span>
          {row.description && (
            <span className="block truncate text-xs text-fg-muted" title={row.description}>
              {row.description}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'permissions',
      header: 'Ruxsatlar',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft tabular-nums">
          {row.permissions.length} ta
        </span>
      ),
    },
    {
      key: 'user_count',
      header: 'Xodimlar',
      align: 'right',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-soft tabular-nums">{row.user_count} ta</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Yaratilgan',
      cell: (row) => <DateCell value={row.created_at} />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <RowActions
          inlineCount={1}
          actions={[
            {
              label: row.is_system ? `${row.name} — ko'rish` : `${row.name} — tahrirlash`,
              icon: <Pencil className="size-4" strokeWidth={1.75} />,
              onSelect: () => openEdit(row),
            },
            /* Tizim rolini o'chirib bo'lmaydi — backend ham rad etadi. */
            ...(row.is_system
              ? []
              : [
                  {
                    label: `${row.name} — o'chirish`,
                    icon: <Trash2 className="size-4" strokeWidth={1.75} />,
                    onSelect: () => setDeleting(row),
                    destructive: true,
                  },
                ]),
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Rollar va ruxsatlar"
        subtitle="Xodim panelda nimani ko'rishi va nima qila olishini rol belgilaydi."
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Rollar' }]}
        actions={
          <Button
            variant="primary"
            icon={<Plus className="size-4" strokeWidth={1.75} />}
            onClick={openCreate}
          >
            Yangi rol
          </Button>
        }
      />

      {error ? (
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
              <KeyRound className="size-4" strokeWidth={1.75} />
              Rol berish — «Foydalanuvchilar» bo&apos;limida, xodim qatoridan.
            </span>

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
              emptyMessage="Rol topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta rol` : undefined}
            />
          </Card>
        </>
      )}

      <RoleFormModal open={formOpen} role={editing} onClose={() => setFormOpen(false)} />

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Rolni o'chirish"
        description={deleting?.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Bekor qilish
            </Button>
            <Button
              variant="danger"
              disabled={deleteState.isLoading}
              onClick={() => void confirmDelete()}
            >
              {deleteState.isLoading ? "O'chirilmoqda…" : "O'chirish"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-fg-soft">
            {deleting && deleting.user_count > 0
              ? `Bu rol ${deleting.user_count} ta xodimda bor — o'chirilgach ular shu roldagi ruxsatlarni yo'qotadi.`
              : "Rol o'chiriladi. Bu amalni orqaga qaytarib bo'lmaydi."}
          </p>

          {deleteState.error !== undefined && deleteState.error !== null && (
            <p
              role="alert"
              className="rounded-control border border-danger/25 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
            >
              {getApiErrorMessage(deleteState.error)}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
