import { ChevronDown, Headphones } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';

import { navigation, type NavItem } from '@/config/navigation';
import { cn } from '@/lib/cn';

function Logo() {
  return (
    <div className="flex h-topbar shrink-0 items-center gap-2.5 px-5">
      <span className="grid size-8 place-items-center rounded-full bg-primary">
        <span className="size-3 rounded-full border-[2.5px] border-white" />
      </span>
      <span className="text-xl font-semibold tracking-tight">
        Yopamiz<span className="text-primary">.uz</span>
      </span>
    </div>
  );
}

const itemBase =
  'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors';

/** Faol elementning chap chetidagi yashil vertikal chiziq. */
function ActiveBar() {
  return (
    <span className="absolute inset-y-1.5 -left-3 w-[3px] rounded-r-full bg-primary" aria-hidden />
  );
}

function LeafItem({ item }: { item: NavItem & { to: string } }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          itemBase,
          isActive
            ? 'bg-elevated font-medium text-primary'
            : 'text-fg-muted hover:bg-elevated/60 hover:text-fg',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <ActiveBar />}
          <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
          <span className="truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span className="ml-auto rounded-badge bg-info/15 px-1.5 py-0.5 text-xs font-medium text-info">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function BranchItem({ item }: { item: NavItem & { children: NonNullable<NavItem['children']> } }) {
  const { pathname } = useLocation();
  const Icon = item.icon;
  const hasActiveChild = item.children.some((child) => pathname === child.to);

  // Ichida faol sahifa bo'lsa guruh ochiq boshlanadi — foydalanuvchi
  // qayerdaligini ko'rmay qolmasligi uchun.
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          itemBase,
          hasActiveChild ? 'text-fg' : 'text-fg-muted hover:bg-elevated/60 hover:text-fg',
        )}
      >
        <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
        <span className="truncate">{item.label}</span>
        <ChevronDown
          className={cn('ml-auto size-4 shrink-0 transition-transform', open && 'rotate-180')}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-0.5 pl-8">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive }) =>
                cn(
                  'relative rounded-lg px-3 py-2 text-[13px] transition-colors',
                  isActive
                    ? 'bg-elevated font-medium text-primary'
                    : 'text-fg-muted hover:bg-elevated/60 hover:text-fg',
                )
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function SupportCard() {
  return (
    <div className="mx-3 mb-4 rounded-card border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-fg">Yordam kerakmi?</p>
        <Headphones className="size-5 shrink-0 text-fg-muted" strokeWidth={1.75} />
      </div>
      <p className="mt-1 text-xs leading-relaxed text-fg-muted">
        Savollaringiz bo‘lsa biz bilan bog‘laning.
      </p>
      <button
        type="button"
        className="mt-3 w-full rounded-control bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Qo‘llab-quvvatlash
      </button>
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn('flex w-sidebar shrink-0 flex-col border-r border-line bg-sidebar', className)}
    >
      <Logo />

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navigation.map((group) => (
          <div key={group.title} className="mb-2">
            <p className="px-3 pt-4 pb-2 text-[11px] font-medium tracking-wider text-fg-dim uppercase">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) =>
                item.children ? (
                  <BranchItem key={item.label} item={{ ...item, children: item.children }} />
                ) : (
                  <LeafItem key={item.label} item={{ ...item, to: item.to ?? '#' }} />
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      <SupportCard />
    </aside>
  );
}
