import { ArrowLeft, Ban, CircleCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { useLocaleNavigate } from '@/i18n/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { Badge, VerificationBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDateTime } from '@/lib/format';
import { getApiErrorMessage } from '@/shared/api';
import { USER_STATUS_LABELS } from '@/shared/types/adminUsers';

import { BlockUserModal } from './BlockUserModal';
import { useActivateUserMutation, useGetAdminUserQuery } from './adminUsersApi';

const statusTones = {
  active: 'success',
  pending: 'warning',
  blocked: 'danger',
  deleted: 'neutral',
} as const;

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useLocaleNavigate();
  /* `null` — bloklash oynasi yopiq. */
  const [blockTarget, setBlockTarget] = useState<{
    id: string;
    full_name: string;
    phone: string | null;
  } | null>(null);

  const { data, isLoading, error } = useGetAdminUserQuery(id ?? '', { skip: !id });
  const [activate, activateState] = useActivateUserMutation();

  if (!id) return <Navigate to="/foydalanuvchilar" replace />;

  const crumbs = [
    { label: 'Bosh sahifa', to: '/' },
    { label: 'Foydalanuvchilar', to: '/foydalanuvchilar' },
    { label: data?.full_name?.trim() || data?.phone || 'Tafsilot' },
  ];

  if (error) {
    return (
      <>
        <PageHeader title="Foydalanuvchi" breadcrumbs={crumbs} />
        <Card>
          <ErrorState message={getApiErrorMessage(error)} />
        </Card>
      </>
    );
  }

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Foydalanuvchi" breadcrumbs={crumbs} />
        <div className="h-64 animate-pulse rounded-card bg-elevated" />
      </>
    );
  }

  const name = data.full_name?.trim() || data.phone || data.email || 'Foydalanuvchi';

  return (
    <>
      <PageHeader
        breadcrumbs={crumbs}
        title={name}
        subtitle={USER_STATUS_LABELS[data.status]}
        actions={
          <>
            <Button
              variant="secondary"
              icon={<ArrowLeft className="size-4" strokeWidth={1.75} />}
              onClick={() => void navigate('/foydalanuvchilar')}
            >
              Ro&apos;yxatga
            </Button>

            {/*
              Bloklangan hisobda «bloklash», faol hisobda «faollashtirish»
              tugmasi chizilmaydi: ular hech nima o'zgartirmasdi va
              bosilganda server rad qilardi.
            */}
            {data.status === 'blocked' ? (
              <Button
                icon={<CircleCheck className="size-4" strokeWidth={1.75} />}
                disabled={activateState.isLoading}
                onClick={() => void activate(data.id)}
              >
                {activateState.isLoading ? 'Faollashtirilmoqda…' : 'Faollashtirish'}
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={<Ban className="size-4" strokeWidth={1.75} />}
                onClick={() =>
                  setBlockTarget({
                    id: data.id,
                    full_name: data.full_name,
                    phone: data.phone,
                  })
                }
              >
                Bloklash
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={name} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-fg">{name}</p>
              <p className="text-sm text-fg-muted">{data.phone || data.email || '—'}</p>
            </div>
          </div>

          <InfoList className="mt-6">
            <InfoRow label="Telefon" value={data.phone || '—'} />
            <InfoRow label="Email" value={data.email || '—'} />
            <InfoRow
              label="Holat"
              value={
                <Badge tone={statusTones[data.status]}>{USER_STATUS_LABELS[data.status]}</Badge>
              }
            />
            <InfoRow
              label="Telefon tasdiqlangan"
              value={
                <VerificationBadge
                  label={data.phone_verified ? 'Ha' : "Yo'q"}
                  verified={data.phone_verified}
                />
              }
            />
            <InfoRow
              label="Email tasdiqlangan"
              value={
                <VerificationBadge
                  label={data.email_verified ? 'Ha' : "Yo'q"}
                  verified={data.email_verified}
                />
              }
            />
            <InfoRow label="Kirish usuli" value={data.auth_provider || '—'} />
            <InfoRow
              label="Oxirgi kirish"
              value={data.last_login_at ? formatDateTime(data.last_login_at) : 'Hech qachon'}
            />
            <InfoRow label="Ro'yxatdan o'tgan" value={formatDateTime(data.created_at)} />
          </InfoList>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <ShieldCheck className="size-4 text-primary" strokeWidth={1.75} />
            Panel huquqlari
          </h2>

          {data.is_superuser ? (
            <div className="mt-4 rounded-control border border-primary/25 bg-primary/10 px-3.5 py-3">
              <p className="text-sm font-medium text-primary">Super Admin</p>
              <p className="mt-1 text-xs leading-relaxed text-fg-soft">
                Huquq rollardan emas, hisobning o&apos;zidan keladi.
              </p>
            </div>
          ) : !data.is_staff ? (
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              Oddiy foydalanuvchi — admin panelga kira olmaydi. Kirish huquqi rol biriktirish orqali
              beriladi.
            </p>
          ) : data.roles.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              Panelga kiradi, lekin rol biriktirilmagan — hech qanday bo&apos;lim ko&apos;rinmaydi.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.roles.map((role) => (
                <Badge key={role} tone="primary">
                  {role}
                </Badge>
              ))}
            </div>
          )}

          <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-fg-dim">
            Rollarni «Sozlamalar → Admin foydalanuvchilar» bo&apos;limidan o&apos;zgartiriladi.
          </p>
        </Card>
      </div>

      <BlockUserModal user={blockTarget} onClose={() => setBlockTarget(null)} />
    </>
  );
}
