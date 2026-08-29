import { Bell, Menu } from 'lucide-react';

import { useT } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';

import { ThemeToggle } from './ThemeToggle';
import { LocaleToggle } from './LocaleToggle';

import { UserMenu } from './UserMenu';

interface TopbarProps {
  onToggleSidebar: () => void;
  /** O'qilmagan bildirishnomalar soni. 0 bo'lsa badge ko'rsatilmaydi. */
  notificationCount?: number;
}

function IconAction({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative grid size-9 place-items-center rounded-control text-fg-muted transition-colors hover:bg-elevated hover:text-fg',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Topbar({ onToggleSidebar, notificationCount = 0 }: TopbarProps) {
  const { m } = useT();

  return (
    <header className="sticky top-0 z-20 flex h-topbar shrink-0 items-center justify-between border-b border-line bg-topbar px-6">
      <IconAction label={m.layout.toggleSidebar} onClick={onToggleSidebar} className="-ml-2">
        <Menu className="size-5" strokeWidth={1.75} />
      </IconAction>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LocaleToggle />

        <IconAction label={m.layout.notifications}>
          <Bell className="size-5" strokeWidth={1.75} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] leading-4 font-semibold text-white">
              {notificationCount}
            </span>
          )}
        </IconAction>

        <UserMenu />
      </div>
    </header>
  );
}
