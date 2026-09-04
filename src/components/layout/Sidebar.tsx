import { ChevronDown, Headphones } from 'lucide-react';
import { useSyncExternalStore, type ComponentProps } from 'react';
import { useLocation } from 'react-router';
import { NavLink } from '@/i18n/navigation';

import { navigation, type NavGroup, type NavItem } from '@/config/navigation';
import { stripLocale } from '@/i18n/config';
import { useT } from '@/i18n/I18nProvider';
import type { Messages } from '@/i18n/messages/uz';
import { usePermissions } from '@/features/adminRoles/usePermissions';
import { useQueueCounts, type QueueCounts } from '@/features/dashboard/useQueueCounts';
import { cn } from '@/lib/cn';

import { getOpenGroups, subscribeToGroups, toggleGroup } from './sidebarGroups';

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={cn(
        'flex h-topbar shrink-0 items-center gap-2.5',
        collapsed ? 'justify-center px-0' : 'px-5',
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-solid">
        <span className="size-3 rounded-full border-[2.5px] border-white" />
      </span>
      {!collapsed && (
        <span className="text-xl font-semibold tracking-tight">
          Yopamiz<span className="text-primary">.uz</span>
        </span>
      )}
    </div>
  );
}

const itemBase = cn(
  'relative flex h-9 w-full items-center gap-2.5 rounded-control px-2.5 text-[13px]',
  'transition-[background-color,color] duration-(--dur) ease-soft',
  'outline-none focus-visible:shadow-(--ring)',
);

/** Faol elementning chap chetidagi yashil vertikal chiziq. */
function ActiveBar() {
  return (
    <span className="absolute inset-y-1.5 -left-3 w-0.5 rounded-r-full bg-primary" aria-hidden />
  );
}

/**
 * Ish navbati soni.
 *
 * Nol bo'lsa UMUMAN chizilmaydi: «0» ish emas, va bo'sh navbatni
 * to'lganidan farqlab bo'lmay qolardi.
 *
 * Rangi NEYTRAL. Ilgari u sariq edi va menyudagi o'nlab kichik sariq
 * tamg'a Dashboarddagi haqiqiy ogohlantirishlardan baland ovozda
 * gapirardi. Sariq yoki qizil faqat KECHIKKAN ish uchun o'rinli
 * bo'lardi, lekin sanoq endpointi kutish vaqtini bermaydi — u
 * qo'shilgunicha son shunchaki son bo'lib qoladi.
 */
function QueueBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="ml-auto rounded-badge border border-neutral-line bg-neutral-quiet px-1.5 py-0.5 text-[11px] leading-[16px] font-medium text-fg-muted tabular-nums">
      {count}
    </span>
  );
}

function LeafItem({
  item,
  m,
  counts,
  collapsed,
}: {
  item: NavItem & { to: string };
  m: Messages;
  counts: QueueCounts;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const label = item.label(m);
  const count = item.queue ? counts[item.queue] : 0;

  return (
    <NavLink
      to={item.to}
      // `title` HAR DOIM: yig'ilgan rejimda yorliq umuman yo'q, ochiq
      // rejimda esa uzun nomlar («Yechim moderatsiyasi») badge yonida
      // qisqarib qoladi.
      title={label}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          itemBase,
          collapsed && 'justify-center px-0',
          isActive
            ? // Yashil TUS, to'ldirilgan blok emas: faol band panelning
              // qolgan qismidan ajralib tursin, lekin ekrandagi eng
              // baland ovozli narsa bo'lib qolmasin.
              'bg-primary-quiet font-medium text-primary'
            : 'text-fg-soft hover:bg-surface-hover hover:text-fg',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && <ActiveBar />}
          <span className="relative shrink-0">
            <Icon className="size-4" strokeWidth={1.75} />
            {/* Yig'ilgan rejimda son sig'maydi — nuqta bo'lib qoladi,
                lekin ish borligi baribir ko'rinib turishi kerak. */}
            {collapsed && count > 0 && (
              <span className="absolute -top-0.5 -right-1 size-2 rounded-full bg-warning" />
            )}
          </span>
          {!collapsed && (
            <>
              <span className="truncate">{label}</span>
              <QueueBadge count={count} />
            </>
          )}
        </>
      )}
    </NavLink>
  );
}

/**
 * Guruh — yig'iladigan va holati eslab qolinadigan.
 *
 * Ilgari sarlavhalar oddiy yozuv edi va «Tayyor materiallar» ostida
 * o'n to'rtta band yotardi: ro'yxat ekranga sig'masdi va kerakli
 * bandni ko'z bilan qidirishga to'g'ri kelardi.
 */
function Group({
  group,
  m,
  counts,
  collapsed,
  open,
}: {
  group: NavGroup;
  m: Messages;
  counts: QueueCounts;
  collapsed: boolean;
  open: boolean;
}) {
  const title = group.title(m);
  // Guruhdagi umumiy ish — yopiq bo'lsa ham ichida ish borligi ko'rinsin.
  const pending = group.items.reduce(
    (total, item) => total + (item.queue ? counts[item.queue] : 0),
    0,
  );

  if (collapsed) {
    return (
      <div className="mt-2 flex flex-col gap-0.5 border-t border-line-subtle pt-2 first:mt-0 first:border-t-0 first:pt-0">
        {group.items.map((item) => (
          <LeafItem
            key={item.to ?? item.label(m)}
            item={{ ...item, to: item.to ?? '#' }}
            m={m}
            counts={counts}
            collapsed
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 first:mt-0">
      <button
        type="button"
        onClick={() => toggleGroup(group.id)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-2 rounded-control px-2.5 py-1.5',
          'text-[11px] font-medium tracking-[0.08em] text-fg-dim uppercase',
          'transition-colors duration-(--dur) ease-soft outline-none',
          'hover:text-fg-muted focus-visible:shadow-(--ring)',
        )}
      >
        <span className="truncate">{title}</span>
        {!open && pending > 0 && (
          <span className="rounded-badge border border-neutral-line bg-neutral-quiet px-1.5 py-0.5 text-[10px] font-medium text-fg-muted tabular-nums">
            {pending}
          </span>
        )}
        <ChevronDown
          className={cn('ml-auto size-3.5 shrink-0 transition-transform', !open && '-rotate-90')}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-0.5">
          {group.items.map((item) => (
            <LeafItem
              key={item.to ?? item.label(m)}
              item={{ ...item, to: item.to ?? '#' }}
              m={m}
              counts={counts}
              collapsed={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Qo'llab-quvvatlash — karta emas, bitta qator.
 *
 * Ilgari bu yerda ~130px balandlikdagi karta turardi va menyu
 * ro'yxatidan o'sha balandlikni tortib olardi. Havola o'sha-o'sha,
 * faqat joy egallamaydi.
 */
function SupportRow({ collapsed }: { collapsed: boolean }) {
  const { m } = useT();

  return (
    <button
      type="button"
      title={collapsed ? m.layout.supportAction : undefined}
      aria-label={collapsed ? m.layout.supportAction : undefined}
      className={cn(
        'flex h-9 items-center gap-2.5 rounded-control px-2.5 text-[13px] text-fg-muted',
        'transition-colors duration-(--dur) ease-soft outline-none',
        'hover:bg-surface-hover hover:text-fg focus-visible:shadow-(--ring)',
        collapsed && 'justify-center px-0',
      )}
    >
      <Headphones className="size-4 shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{m.layout.supportAction}</span>}
    </button>
  );
}

export function Sidebar({
  collapsed = false,
  className,
  ...rest
}: ComponentProps<'aside'> & { collapsed?: boolean }) {
  const { m } = useT();
  const { can, isError } = usePermissions();
  const counts = useQueueCounts();
  const { pathname } = useLocation();

  const openGroups = useSyncExternalStore(subscribeToGroups, getOpenGroups, getOpenGroups);

  /*
   * Menyu ruxsatga qarab filtrlanadi. Guruh butunlay bo'shab qolsa
   * uning SARLAVHASI ham chizilmaydi — aks holda ekranda ostida hech
   * narsa yo'q "Moliya" yozuvi osilib qolardi.
   */
  const visible = navigation
    .map((group) => ({ ...group, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0);

  const current = stripLocale(pathname);

  return (
    <aside
      {...rest}
      className={cn(
        'flex shrink-0 flex-col border-r border-line-subtle bg-sidebar',
        collapsed ? 'w-16' : 'w-sidebar',
        className,
      )}
    >
      <Logo collapsed={collapsed} />

      <nav className={cn('flex-1 overflow-y-auto pb-4', collapsed ? 'px-2' : 'px-3')}>
        {/*
          Ruxsatlar kelmasa menyu bo'sh qoladi — sababini aytmasak,
          panel buzilgandek ko'rinadi.
        */}
        {isError && !collapsed && (
          <p className="mx-1 mt-4 rounded-control border border-danger/25 bg-danger/10 px-3 py-2.5 text-xs leading-relaxed text-danger">
            {m.layout.permissionsFailed}
          </p>
        )}

        {visible.map((group) => (
          <Group
            key={group.id}
            group={group}
            m={m}
            counts={counts}
            collapsed={collapsed}
            /* Saqlangan tanlov, YOKI ichida ochilgan sahifa bor: odam
               o'zi yopgan guruhda turgan bo'lsa ham qayerdaligini
               ko'rmay qolmasligi kerak. */
            open={(openGroups[group.id] ?? true) || group.items.some((item) => item.to === current)}
          />
        ))}
      </nav>

      {/* Pastki blok o'z chizig'i bilan ajraladi — u navigatsiya emas. */}
      <div className={cn('border-t border-line-subtle py-2', collapsed ? 'px-2' : 'px-3')}>
        <SupportRow collapsed={collapsed} />
      </div>
    </aside>
  );
}
