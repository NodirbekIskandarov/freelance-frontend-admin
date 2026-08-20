import { KeyRound, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime, formatSom } from '@/lib/format';
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
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      cell: (row) => (
        <span className="flex items-center justify-end gap-2">
          <IconButton
            label={row.is_system ? `${row.name} — ko'rish` : `${row.name} — tahrirlash`}
            tone="info"
            size="sm"
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" strokeWidth={1.75} />
          </IconButton>

          {/* Tizim rolini o'chirib bo'lmaydi — backend ham rad etadi. */}
          {!row.is_system && (
            <IconButton
              label={`${row.name} — o'chirish`}
              tone="danger"
              size="sm"
              onClick={() => setDeleting(row)}
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
        </span>
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
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
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
              isLoading={isLoading || isFetching}
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
