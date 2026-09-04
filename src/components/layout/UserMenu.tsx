import { ChevronDown, LogOut, Rows3, UserRound } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router';
import { Link } from '@/i18n/navigation';

import { Avatar } from '@/components/ui/Avatar';
import { useSession } from '@/features/auth/useSession';
import { useT } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';
import { getDensity, setDensity, subscribeToDensity } from '@/lib/density';

/**
 * Yuqori o'ngdagi foydalanuvchi menyusi.
 *
 * Ilgari bu yerda «Admin / Super Admin» degan QAT'IY yozuv turardi va
 * tugma hech nima qilmasdi — kim kirganini bilishning yo'li yo'q edi va
 * chiqish faqat yon menyudagi havola orqali bo'lardi.
 */
export function UserMenu() {
  const { m } = useT();
  const { displayName, roleLabel, signOut, isSigningOut } = useSession();
  const [open, setOpen] = useState(false);
  const density = useSyncExternalStore(
    subscribeToDensity,
    getDensity,
    () => 'comfortable' as const,
  );
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
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-control border border-line bg-elevated shadow-dropdown"
        >
          <div className="border-b border-line-subtle px-4 py-3">
            <p className="truncate text-sm font-medium text-fg">{displayName}</p>
            <p className="text-xs text-fg-muted">{roleLabel}</p>
          </div>

          <Link
            to="/profil"
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-fg-soft transition-colors duration-(--dur) ease-soft hover:bg-surface-hover hover:text-fg"
          >
            <UserRound className="size-4" strokeWidth={1.75} />
            {m.layout.profile}
          </Link>

          {/*
            Zichlik tanlovi — shu yerda, chunki u FOYDALANUVCHINING
            afzalligi, sahifaning sozlamasi emas: bir admin kuniga
            o'nlab qatorni ko'zdan kechiradi va unga ekranga ko'proq
            qator sig'gani muhim.
          */}
          <div className="flex items-center justify-between gap-3 border-t border-line-subtle px-4 py-2.5">
            <span className="flex items-center gap-2.5 text-[13px] text-fg-soft">
              <Rows3 className="size-4" strokeWidth={1.75} />
              Zich jadval
            </span>
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={density === 'compact'}
              onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
              className={cn(
                'relative h-5 w-9 shrink-0 rounded-badge border transition-colors duration-(--dur) ease-soft',
                'outline-none focus-visible:shadow-(--ring)',
                density === 'compact' ? 'border-primary bg-primary' : 'border-line-strong bg-input',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'absolute top-0.5 size-3.5 rounded-full transition-[left] duration-(--dur) ease-soft',
                  density === 'compact' ? 'left-4 bg-on-accent' : 'left-0.5 bg-fg-dim',
                )}
              />
            </button>
          </div>

          <button
            type="button"
            role="menuitem"
            disabled={isSigningOut}
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2.5 border-t border-line-subtle px-4 py-2.5 text-left text-[13px] text-danger transition-colors duration-(--dur) ease-soft hover:bg-danger-quiet disabled:opacity-50"
          >
            <LogOut className="size-4" strokeWidth={1.75} />
            {isSigningOut ? m.layout.loggingOut : m.layout.logout}
          </button>
        </div>
      )}
    </div>
  );
}
