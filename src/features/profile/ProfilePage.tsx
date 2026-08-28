import { LogOut, ShieldCheck } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { InfoList, InfoRow } from '@/components/ui/InfoRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { useSession } from '@/features/auth/useSession';
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
  const { user, roles, isSuperuser, displayName, signOut, isSigningOut } = useSession();

  return (
    <>
      <PageHeader
        breadcrumbsPosition="above"
        breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: 'Profil' }]}
        title="Profil"
        subtitle="Hisobingiz va paneldagi huquqlaringiz."
        actions={
          <Button
            variant="danger"
            icon={<LogOut className="size-4" strokeWidth={1.75} />}
            disabled={isSigningOut}
            onClick={() => void signOut()}
          >
            {isSigningOut ? 'Chiqilmoqda…' : 'Chiqish'}
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
                {isSuperuser ? 'Super Admin' : 'Panel xodimi'}
              </p>
            </div>
          </div>

          <InfoList className="mt-6">
            <InfoRow label="Telefon" value={user?.phone || '—'} />
            <InfoRow label="Email" value={user?.email || '—'} />
            <InfoRow
              label="Telefon tasdiqlangan"
              value={
                <Badge tone={user?.phone_verified ? 'success' : 'neutral'}>
                  {user?.phone_verified ? 'Ha' : "Yo'q"}
                </Badge>
              }
            />
            <InfoRow
              label="Oxirgi kirish"
              value={user?.last_login_at ? formatDateTime(user.last_login_at) : '—'}
            />
            <InfoRow
              label="Ro'yxatdan o'tgan"
              value={user?.created_at ? formatDateTime(user.created_at) : '—'}
            />
          </InfoList>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <ShieldCheck className="size-4 text-primary" strokeWidth={1.75} />
            Huquqlar
          </h2>

          {isSuperuser ? (
            /*
              Superuserga rollar ro'yxati ko'rsatilmaydi: uning huquqi
              rollardan kelmaydi va ro'yxat bo'sh bo'lsa ham u hamma
              narsani ko'radi — bo'sh ro'yxat chalg'itardi.
            */
            <div className="mt-4 rounded-control border border-primary/25 bg-primary/10 px-3.5 py-3">
              <p className="text-sm font-medium text-primary">Super Admin</p>
              <p className="mt-1 text-xs leading-relaxed text-fg-soft">
                Barcha bo&apos;limlarga to&apos;liq kirish. Huquq rollardan emas, hisobning
                o&apos;zidan keladi.
              </p>
            </div>
          ) : roles.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">
              Hech qanday rol biriktirilmagan. Panelga kirasiz, lekin bo&apos;limlar
              ko&apos;rinmaydi — administratordan rol so&apos;rang.
            </p>
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
