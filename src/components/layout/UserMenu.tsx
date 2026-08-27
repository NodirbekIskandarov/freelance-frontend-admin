import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { Avatar } from '@/components/ui/Avatar';
import { useSession } from '@/features/auth/useSession';
import { cn } from '@/lib/cn';

/**
 * Yuqori o'ngdagi foydalanuvchi menyusi.
 *
 * Ilgari bu yerda «Admin / Super Admin» degan QAT'IY yozuv turardi va
 * tugma hech nima qilmasdi — kim kirganini bilishning yo'li yo'q edi va
 * chiqish faqat yon menyudagi havola orqali bo'lardi.
 */
export function UserMenu() {
  const { displayName, roleLabel, signOut, isSigningOut } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  /*
   * Sahifa almashsa menyu yopiladi — render paytida, effektda emas:
   * effekt bilan yangi sahifa bir kadr davomida ochiq menyu bilan
   * chizilardi.
   */
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative ml-2">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2.5 rounded-control py-1.5 pr-2 pl-1.5 transition-colors hover:bg-elevated"
      >
        <Avatar name={displayName} />
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-[160px] truncate text-sm font-medium text-fg">
            {displayName}
          </span>
          <span className="block text-xs text-fg-muted">{roleLabel}</span>
        </span>
        <ChevronDown
          className={cn('size-4 text-fg-muted transition-transform', open && 'rotate-180')}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-card border border-line bg-card shadow-lg"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-fg">{displayName}</p>
            <p className="text-xs text-fg-muted">{roleLabel}</p>
          </div>

          <Link
            to="/profil"
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg-soft transition-colors hover:bg-elevated hover:text-fg"
          >
            <UserRound className="size-4" strokeWidth={1.75} />
            Profil
          </Link>

          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            {isSigningOut ? 'Chiqilmoqda…' : 'Chiqish'}
          </button>
        </div>
      )}
    </div>
  );
}
