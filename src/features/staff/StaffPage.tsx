import { ShieldCheck, ShieldOff, UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DateCell } from '@/components/ui/Cells';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { usePermissions } from '@/features/adminRoles/usePermissions';
import { useGetAdminUsersQuery } from '@/features/users/adminUsersApi';
import { formatDateTime } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import { USER_STATUS_LABELS, type AdminUserAccount } from '@/shared/types/adminUsers';

import { StaffRolesModal } from './StaffRolesModal';

/**
 * Admin tizimi foydalanuvchilari.
 *
 * Ikki ro'yxat bitta ekranda: panelga kirish huquqi borlar va qolgan
 * hammasi. Ular BIR XIL manbadan (`/admin/users/`) keladi, faqat
 * `?is_staff=` filtri bilan ajratilgan — «admin» alohida turdagi hisob
 * emas, oddiy foydalanuvchining rol berilgan holati.
 *
 * Faqat superuserga: bu ekran kimga qanday huquq berilishini hal qiladi
 * va uni rol boshqara oladigan har kimga ochib qo'yish huquqni
 * o'z-o'ziga oshirib olish yo'lini ochardi.
 */
export function StaffPage() {
  const { isSuperuser, isLoading: permissionsLoading } = usePermissions();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  /* `null` — rollar oynasi yopiq. */
  const [rolesTarget, setRolesTarget] = useState<AdminUserAccount | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const staff = useGetAdminUsersQuery(
    { is_staff: true, page_size: 100, ordering: '-created_at' },
    { skip: !isSuperuser },
  );

  const others = useGetAdminUsersQuery(
    {
      is_staff: false,
      page,
      page_size: 10,
      ordering: '-created_at',
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    { skip: !isSuperuser },
  );

  if (permissionsLoading) {
    return <div className="h-64 bg-skeleton rounded-card" />;
  }

  if (!isSuperuser) {
    /*
      Yashirish emas, aytish: menyuda ham ko'rinmaydi, lekin manzilni
      qo'lda yozgan odam nima uchun kira olmayotganini bilsin. Haqiqiy
      chek baribir serverda.
    */
    return (
      <>
        <PageHeader title="Admin foydalanuvchilar" />
        <Card className="p-8 text-center">
          <ShieldOff className="mx-auto size-8 text-fg-dim" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-fg">Bu bo&apos;lim faqat Super Adminga</p>
          <p className="mt-1 text-sm text-fg-muted">
            Kimga qanday huquq berilishini shu yerda hal qilinadi.
          </p>
        </Card>
      </>
    );
  }

  function userName(row: AdminUserAccount): string {
    return row.full_name?.trim() || row.phone || row.email || 'Foydalanuvchi';
  }

  const identityColumn: Column<AdminUserAccount> = {
    key: 'user',
    header: 'Foydalanuvchi',
    className: 'min-w-[220px]',
    cell: (row) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={userName(row)} size="sm" />
        <span className="min-w-0 leading-snug">
          <Link
            to={`/foydalanuvchilar/${row.id}`}
            className="block truncate text-fg transition-colors hover:text-primary hover:underline"
          >
            {userName(row)}
          </Link>
          <span className="block truncate text-xs text-fg-muted">
            {row.phone || row.email || '—'}
          </span>
        </span>
      </span>
    ),
  };

  const staffColumns: Column<AdminUserAccount>[] = [
    identityColumn,
    {
      key: 'roles',
      header: 'Rollar',
      className: 'min-w-[200px]',
      cell: (row) =>
        row.is_superuser ? (
          <Badge tone="primary">Super Admin</Badge>
        ) : row.roles.length === 0 ? (
          // Rolsiz xodim panelga kiradi va hech nima ko'rmaydi — bu
          // holat ko'zga tashlanib tursin.
          <Badge tone="warning">Rol yo&apos;q</Badge>
        ) : (
          <span className="flex flex-wrap gap-1.5">
            {row.roles.map((role) => (
              <Badge key={role} tone="info">
                {role}
              </Badge>
            ))}
          </span>
        ),
    },
    {
      key: 'last_login_at',
      header: 'Oxirgi kirish',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">
          {row.last_login_at ? formatDateTime(row.last_login_at) : 'Hech qachon'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) =>
        row.is_superuser ? (
          // Superuserning huquqi rollardan kelmaydi va uni bu yerdan
          // o'zgartirish xatoni tuzata oladigan hisobni qulflab qo'yardi.
          <span className="text-xs text-fg-dim">O&apos;zgartirilmaydi</span>
        ) : (
          <IconButton
            label={`${userName(row)} — rollarini o'zgartirish`}
            size="sm"
            tone="info"
            onClick={() => setRolesTarget(row)}
          >
            <ShieldCheck className="size-4" strokeWidth={1.75} />
          </IconButton>
        ),
    },
  ];

  const candidateColumns: Column<AdminUserAccount>[] = [
    identityColumn,
    {
      key: 'status',
      header: 'Holat',
      cell: (row) => (
        <Badge tone={row.status === 'active' ? 'success' : 'neutral'}>
          {USER_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: "Ro'yxatdan o'tgan",
      cell: (row) => <DateCell value={row.created_at} />,
    },
    {
      key: 'actions',
      header: 'Amallar',
      align: 'right',
      // O'ng chetga yopishadi — jadval siljiganda ham ko'rinadi.
      sticky: true,
      cell: (row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={<UserRoundPlus className="size-4" strokeWidth={1.75} />}
          onClick={() => setRolesTarget(row)}
        >
          Admin qilish
        </Button>
      ),
    },
  ];

  const error = staff.error ?? others.error;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Admin foydalanuvchilar' }]}
        title="Admin foydalanuvchilar"
        subtitle="Panelga kirish huquqi rollardan kelib chiqadi: rol bering — kira oladi, olib tashlang — kira olmaydi."
      />

      {error ? (
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      ) : (
        <div className="grid gap-4">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
                <ShieldCheck className="size-4 text-primary" strokeWidth={1.75} />
                Panel xodimlari
                <span className="rounded-badge border border-line bg-elevated px-2.5 py-1 text-xs text-fg-muted">
                  {staff.data?.count ?? 0} ta
                </span>
              </h2>
            </div>

            <Table
              columns={staffColumns}
              rows={staff.data?.results ?? []}
              rowKey={(row) => row.id}
              isLoading={staff.isLoading}
              skeletonRows={4}
              density="compact"
              emptyMessage="Panelga kira oladigan xodim yo'q"
            />
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-fg">
                Ro&apos;yxatdan o&apos;tgan foydalanuvchilar
              </h2>
              <SearchInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Ism, telefon yoki email..."
                className="w-64"
              />
            </div>

            <Table
              columns={candidateColumns}
              rows={others.data?.results ?? []}
              rowKey={(row) => row.id}
              isLoading={others.isLoading || others.isFetching}
              skeletonRows={6}
              density="compact"
              emptyMessage="Foydalanuvchi topilmadi"
            />

            <Pagination
              page={page}
              totalPages={others.data?.total_pages ?? 1}
              onPageChange={setPage}
            />
          </Card>
        </div>
      )}

      <StaffRolesModal user={rolesTarget} onClose={() => setRolesTarget(null)} />
    </>
  );
}
