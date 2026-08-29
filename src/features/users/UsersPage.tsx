import {
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  KeyRound,
  Lock,
  Users,
  UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useLocaleNavigate } from '@/i18n/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { formatDateTime, formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { getApiErrorMessage } from '@/shared/api';
import {
  USER_ORDERING_OPTIONS,
  USER_STATUS_LABELS,
  type AdminUserAccount,
} from '@/shared/types/adminUsers';
import type { UserStatus } from '@/shared/types/auth';

import { StaffRolesModal } from '@/features/adminRoles/StaffRolesModal';
import { usePermissions } from '@/features/adminRoles/usePermissions';

import { useActivateUserMutation, useGetAdminUsersQuery } from './adminUsersApi';
import { BlockUserModal } from './BlockUserModal';

const statusOptions = [
  { value: 'all', label: 'Barcha statuslar' },
  { value: 'active', label: 'Faol' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'blocked', label: 'Bloklangan' },
  { value: 'deleted', label: "O'chirilgan" },
];

const statusTones: Record<UserStatus, BadgeTone> = {
  active: 'success',
  pending: 'warning',
  blocked: 'danger',
  deleted: 'neutral',
};

/**
 * Ko'rsatkichlar uchun alohida endpoint yo'q, shuning uchun ular
 * status filtri bilan yengil so'rovlardan olinadi: `page_size=1` —
 * bizga faqat `count` kerak, qatorlar emas.
 */
function useStatusCount(status?: UserStatus) {
  const { data } = useGetAdminUsersQuery({ page_size: 1, ...(status ? { status } : {}) });
  return data?.count;
}

function statValue(value: number | undefined): string {
  return value === undefined ? '—' : formatSom(value);
}

export function UsersPage() {
  const navigate = useLocaleNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [status, setStatus] = useState<UserStatus | 'all'>('all');
  const [ordering, setOrdering] = useState<string>('-created_at');
  const [search, setSearch] = useState('');
  const { can } = usePermissions();
  const canManageRoles = can('roles.manage');

  const [rolesTarget, setRolesTarget] = useState<AdminUserAccount | null>(null);
  const [blockTarget, setBlockTarget] = useState<AdminUserAccount | null>(null);

  // Har harf uchun so'rov yubormaslik kerak — foydalanuvchi yozib
  // bo'lgandan keyin bitta so'rov ketadi.
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, error } = useGetAdminUsersQuery({
    page,
    page_size: perPage,
    ordering,
    ...(status !== 'all' ? { status } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const totalCount = useStatusCount();
  const activeCount = useStatusCount('active');
  const pendingCount = useStatusCount('pending');
  const blockedCount = useStatusCount('blocked');

  const [activateUser, { isLoading: isActivating, error: activateError }] =
    useActivateUserMutation();

  const columns: Column<AdminUserAccount>[] = [
    {
      key: 'full_name',
      header: 'Foydalanuvchi',
      cell: (row) => (
        <span className="flex items-center gap-3">
          <Avatar name={row.full_name || row.email} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-fg">{row.full_name || '—'}</span>
            <span className="block truncate text-xs text-fg-muted">{row.phone ?? '—'}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      className: 'max-w-[220px]',
      cell: (row) => (
        <span className="block truncate" title={row.email}>
          {row.email || '—'}
        </span>
      ),
    },
    {
      key: 'verified',
      header: 'Tasdiqlangan',
      cell: (row) => (
        <span className="flex flex-wrap gap-1.5">
          <Badge tone={row.phone_verified ? 'success' : 'neutral'}>Telefon</Badge>
          <Badge tone={row.email_verified ? 'success' : 'neutral'}>Email</Badge>
        </span>
      ),
    },
    {
      key: 'created_at',
      header: "Ro'yxatdan o'tgan",
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.created_at)}</span>
      ),
    },
    {
      key: 'last_login_at',
      header: 'Oxirgi kirish',
      cell: (row) => (
        <span className="whitespace-nowrap text-fg-muted">{formatDateTime(row.last_login_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <span className="flex items-center gap-1.5">
          <Badge tone={statusTones[row.status]}>{USER_STATUS_LABELS[row.status]}</Badge>
          {row.is_staff && <Badge tone="primary">Xodim</Badge>}
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
          {/* Tafsilot — birinchi amal: qolganlari qaror talab qiladi,
              bu esa qaror qabul qilishdan oldin qaraydigan joy. */}
          <IconButton
            label={`${row.full_name || row.email} — tafsilot`}
            size="sm"
            onClick={() => void navigate(`/foydalanuvchilar/${row.id}`)}
          >
            <Eye className="size-4" strokeWidth={1.75} />
          </IconButton>

          {/* Rol faqat xodimga beriladi — oddiy foydalanuvchi panelga kirmaydi. */}
          {row.is_staff && canManageRoles && (
            <IconButton
              label={`${row.full_name || row.email} — rollari`}
              tone="info"
              size="sm"
              onClick={() => setRolesTarget(row)}
            >
              <KeyRound className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}

          {row.status !== 'active' && (
            <IconButton
              label={`${row.full_name || row.email} — faollashtirish`}
              tone="success"
              size="sm"
              disabled={isActivating}
              onClick={() => void activateUser(row.id)}
            >
              <CircleCheck className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}

          {row.status !== 'blocked' && (
            <IconButton
              label={`${row.full_name || row.email} — bloklash`}
              tone="danger"
              size="sm"
              onClick={() => setBlockTarget(row)}
            >
              <Lock className="size-4" strokeWidth={1.75} />
            </IconButton>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Foydalanuvchilar"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Foydalanuvchilar' }]}
      />

      {error ? (
        <div className="rounded-card border border-danger/25 bg-danger/10 p-5 text-sm text-danger">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <>
          {activateError && (
            <div className="mb-4 rounded-card border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
              {getApiErrorMessage(activateError)}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jami foydalanuvchilar"
              value={statValue(totalCount)}
              icon={Users}
              tone="success"
            />
            <StatCard
              label="Faol"
              value={statValue(activeCount)}
              icon={UserRoundCheck}
              tone="purple"
            />
            <StatCard label="Kutilmoqda" value={statValue(pendingCount)} icon={Clock} tone="info" />
            <StatCard
              label="Bloklangan"
              value={statValue(blockedCount)}
              icon={CircleX}
              tone="danger"
            />
          </section>

          <section className="mt-4 flex flex-wrap items-center gap-3">
            <Select
              aria-label="Status bo'yicha filtr"
              options={statusOptions}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as UserStatus | 'all');
                setPage(1);
              }}
              className="w-48"
            />

            <Select
              aria-label="Saralash"
              options={[...USER_ORDERING_OPTIONS]}
              value={ordering}
              onChange={(event) => {
                setOrdering(event.target.value);
                setPage(1);
              }}
              className="w-52"
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
              emptyMessage="Bunday foydalanuvchi topilmadi"
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
              summary={data ? `Jami ${formatSom(data.count)} ta foydalanuvchi` : undefined}
            />
          </Card>
        </>
      )}

      <BlockUserModal user={blockTarget} onClose={() => setBlockTarget(null)} />
      <StaffRolesModal user={rolesTarget} onClose={() => setRolesTarget(null)} />
    </>
  );
}
