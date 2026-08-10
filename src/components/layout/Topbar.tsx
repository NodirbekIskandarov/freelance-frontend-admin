import { Bell, ChevronDown, Menu, Sun } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';

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
  return (
    <header className="sticky top-0 z-20 flex h-topbar shrink-0 items-center justify-between border-b border-line bg-topbar px-6">
      <IconAction label="Menyuni ochish/yopish" onClick={onToggleSidebar} className="-ml-2">
        <Menu className="size-5" strokeWidth={1.75} />
      </IconAction>

      <div className="flex items-center gap-1">
        <IconAction label="Mavzuni almashtirish">
          <Sun className="size-5" strokeWidth={1.75} />
        </IconAction>

        <IconAction label="Bildirishnomalar">
          <Bell className="size-5" strokeWidth={1.75} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] leading-4 font-semibold text-white">
              {notificationCount}
            </span>
          )}
        </IconAction>

        <button
          type="button"
          className="ml-2 flex items-center gap-2.5 rounded-control py-1.5 pr-2 pl-1.5 transition-colors hover:bg-elevated"
        >
          <Avatar name="Admin" />
          <span className="text-left leading-tight">
            <span className="block text-sm font-medium text-fg">Admin</span>
            <span className="block text-xs text-fg-muted">Super Admin</span>
          </span>
          <ChevronDown className="size-4 text-fg-muted" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
