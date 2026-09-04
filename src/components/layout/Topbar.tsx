import { Bell, Menu, Search } from 'lucide-react';

import { IconButton } from '@/components/ui/Button';
import { useT } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';

import { ThemeToggle } from './ThemeToggle';
import { LocaleToggle } from './LocaleToggle';

import { UserMenu } from './UserMenu';

interface TopbarProps {
  onToggleSidebar: () => void;
  /** Tezkor qidiruvni ochadi (Ctrl/Cmd+K bilan bir xil). */
  onOpenSearch: () => void;
  /** O'qilmagan bildirishnomalar soni. 0 bo'lsa badge ko'rsatilmaydi. */
  notificationCount?: number;
}

export function Topbar({ onToggleSidebar, onOpenSearch, notificationCount = 0 }: TopbarProps) {
  const { m } = useT();

  return (
    <header className="sticky top-0 z-20 flex h-topbar shrink-0 items-center justify-between gap-4 border-b border-line-subtle bg-topbar px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <IconButton label={m.layout.toggleSidebar} onClick={onToggleSidebar} className="-ml-2">
          <Menu className="size-[18px]" strokeWidth={1.75} />
        </IconButton>

        {/*
          Qidiruv maydoni EMAS, tugma: palitraning o'zi kirish maydoni
          va ikkinchi maydon chizish odamni qaysi biriga yozishni
          o'ylashga majbur qilardi.
        */}
        {/* Qidiruv — TABLETKA shaklida va kengroq: ilgari u panelning
            o'zi bilan bir xil fonda edi va boshqaruv ekanini ko'rsatib
            turadigan hech nima yo'q edi. */}
        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            'hidden h-9 w-full max-w-100 items-center gap-2 rounded-badge border border-line bg-input px-3.5',
            'text-[13px] text-fg-dim',
            'transition-[background-color,border-color,box-shadow] duration-(--dur) ease-soft',
            'outline-none hover:border-line-strong hover:text-fg-muted focus-visible:shadow-(--ring) sm:flex',
          )}
        >
          <Search className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{m.layout.commandPlaceholder}</span>
          <kbd className="ml-auto rounded-badge border border-neutral-line bg-neutral-quiet px-1.5 py-0.5 font-sans text-[11px] leading-[16px] text-fg-dim">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ThemeToggle />
        <LocaleToggle />

        {/*
          Qo'ng'iroqda RAQAM emas, NUQTA.
          Raqamli blok qatordagi eng to'yingan narsa bo'lib qolardi,
          holbuki aniq son bu yerda hech qanday qaror bermaydi — u
          faqat «qarash kerak» deydi. Aniq son bildirishnomalar
          ro'yxatining o'zida.
        */}
        <IconButton label={m.layout.notifications} className="relative">
          <Bell className="size-[18px]" strokeWidth={1.75} />
          {notificationCount > 0 && (
            <>
              <span
                aria-hidden
                className="absolute top-2 right-2 size-1.5 rounded-full bg-danger ring-2 ring-topbar"
              />
              <span className="sr-only">{notificationCount} ta o‘qilmagan</span>
            </>
          )}
        </IconButton>

        <UserMenu />
      </div>
    </header>
  );
}
