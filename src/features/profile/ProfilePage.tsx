import { LogOut, ShieldCheck } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSession } from '@/features/auth/useSession';
import { useT } from '@/i18n/I18nProvider';
import { formatDateTime } from '@/lib/format';

import { ChangePasswordCard } from './ChangePasswordCard';

/**
 * O'z profili.
 *
 * Backendda "joriy foydalanuvchi" endpointi yo'q, shuning uchun asosiy
 * ma'lumot login javobidan saqlangan yozuvdan o'qiladi. ROLLAR esa
 * `/me/permissions/` dan keladi — o'sha ruxsatning yagona manbai;
 * saqlangan yozuvni brauzerda o'zgartirib bo'ladi va unga ishonib
 * bo'lmaydi.
 */
export function ProfilePage() {
  const { m } = useT();
  const { user, roles, isSuperuser, displayName, signOut, isSigningOut } = useSession();

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: m.layout.home, to: '/dashboard' }, { label: m.profile.title }]}
        title={m.profile.title}
        subtitle={m.profile.subtitle}
        actions={
          <Button
            variant="danger-quiet"
            icon={<LogOut className="size-4" strokeWidth={1.75} />}
            disabled={isSigningOut}
            onClick={() => void signOut()}
          >
            {isSigningOut ? m.layout.loggingOut : m.layout.logout}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={displayName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-fg">{displayName}</p>
              <p className="text-sm text-fg-muted">
                {isSuperuser ? m.layout.superAdmin : m.layout.staffMember}
              </p>
            </div>
          </div>

          <InfoList className="mt-6">
            <InfoRow label={m.profile.phone} value={user?.phone || m.common.none} />
            <InfoRow label={m.profile.email} value={user?.email || m.common.none} />
            <InfoRow
              label={m.profile.phoneVerified}
              value={
                <Badge tone={user?.phone_verified ? 'success' : 'neutral'}>
                  {user?.phone_verified ? m.common.yes : m.common.no}
                </Badge>
              }
            />
            <InfoRow
              label={m.profile.lastLogin}
              value={user?.last_login_at ? formatDateTime(user.last_login_at) : m.common.none}
            />
            <InfoRow
              label={m.profile.registered}
              value={user?.created_at ? formatDateTime(user.created_at) : m.common.none}
            />
          </InfoList>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <ShieldCheck className="size-4 text-primary" strokeWidth={1.75} />
            {m.profile.permissions}
          </h2>

          {isSuperuser ? (
            /*
              Superuserga rollar ro'yxati ko'rsatilmaydi: uning huquqi
              rollardan kelmaydi va ro'yxat bo'sh bo'lsa ham u hamma
              narsani ko'radi — bo'sh ro'yxat chalg'itardi.
            */
            <div className="mt-4 rounded-control border border-primary/25 bg-primary/10 px-3.5 py-3">
              <p className="text-sm font-medium text-primary">{m.layout.superAdmin}</p>
              <p className="mt-1 text-xs leading-relaxed text-fg-soft">
                {m.profile.superAdminNote}
              </p>
            </div>
          ) : roles.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">{m.profile.noRoles}</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge key={role} tone="primary">
                  {role}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <ChangePasswordCard />
      </div>
    </>
  );
}
