import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { navigation } from '@/config/navigation';
import { usePermissions } from '@/features/adminRoles/usePermissions';
import { useT } from '@/i18n/I18nProvider';
import type { Messages } from '@/i18n/messages/uz';
import { useLocaleNavigate } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Qaysi ro'yxat qaysi turdagi yozuvni qidiradi.
 *
 * Global qidiruv endpointi backendda YO'Q, shuning uchun palitra soxta
 * natija chizmaydi. Buning o'rniga u so'rovni tegishli ro'yxatga
 * uzatadi: har bir ro'yxat sahifasi `?search=` ni allaqachon
 * o'qiydi va filtr holatini manzilda saqlaydi.
 *
 * Ya'ni «karimov» deb yozib Enter bosilsa, foydalanuvchilar ro'yxati
 * o'sha so'rov bilan ochiladi — bir bosishda, menyuni kezmasdan.
 */
const SEARCH_TARGETS = [
  { to: '/foydalanuvchilar', label: (m: Messages) => m.nav.users, permission: 'users.view' },
  { to: '/fanlar', label: (m: Messages) => m.nav.subjects, permission: 'catalogue.view' },
  { to: '/topshiriqlar', label: (m: Messages) => m.nav.assignments, permission: 'catalogue.view' },
  { to: '/institutlar', label: (m: Messages) => m.nav.institutes, permission: 'catalogue.view' },
  { to: '/hamyonlar', label: (m: Messages) => m.nav.wallets, permission: 'wallets.view' },
] as const;

interface Entry {
  key: string;
  to: string;
  label: string;
  hint?: string;
}

/** Oddiy "har harf ketma-ket uchraydimi" moslashuvi (fuzzy). */
function matches(haystack: string, needle: string): boolean {
  const text = haystack.toLowerCase();
  const query = needle.toLowerCase().trim();
  if (!query) return true;
  if (text.includes(query)) return true;

  let at = 0;
  for (const char of query) {
    at = text.indexOf(char, at);
    if (at === -1) return false;
    at += 1;
  }
  return true;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { m } = useT();
  const navigate = useLocaleNavigate();
  const { can } = usePermissions();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = useMemo<Entry[]>(
    () =>
      navigation.flatMap((group) =>
        group.items
          .filter((item) => item.to && can(item.permission))
          .map((item) => ({
            key: item.to!,
            to: item.to!,
            label: item.label(m),
            hint: group.title(m),
          })),
      ),
    [m, can],
  );

  const results = useMemo<Entry[]>(() => {
    const found = pages.filter((page) => matches(page.label, query));
    if (!query.trim()) return found;

    // Qidiruv so'zi bilan ro'yxatlarga o'tish — sahifa nomiga mos
    // kelmasa ham odam yozgan narsa yo'qolmasin.
    const searches = SEARCH_TARGETS.filter((target) => can(target.permission)).map((target) => ({
      key: `search:${target.to}`,
      to: `${target.to}?search=${encodeURIComponent(query.trim())}`,
      label: `«${query.trim()}» — ${target.label(m)} ichida qidirish`,
    }));
    return [...found, ...searches];
  }, [pages, query, can, m]);

  // Ro'yxat qisqarganda tanlov oxirida osilib qolmasin.
  const selected = Math.min(active, Math.max(0, results.length - 1));

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    // Fokus keyingi kadrda: dialog hali chizilmagan bo'lishi mumkin.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  function go(entry: Entry | undefined) {
    if (!entry) return;
    onClose();
    void navigate(entry.to);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={m.layout.commandPalette}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[12vh]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-card border border-line bg-card shadow-modal">
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-fg-muted" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            placeholder={m.layout.commandPlaceholder}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose();
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((at) => Math.min(at + 1, results.length - 1));
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((at) => Math.max(at - 1, 0));
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                go(results[selected]);
              }
            }}
            className="h-12 w-full bg-transparent text-sm text-fg placeholder:text-fg-dim focus:outline-none"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-fg-muted">{m.layout.commandEmpty}</li>
          ) : (
            results.map((entry, index) => (
              <li key={entry.key}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(entry)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm transition-colors',
                    index === selected
                      ? 'bg-elevated text-fg'
                      : 'text-fg-soft hover:bg-surface-hover',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                  {entry.hint && <span className="shrink-0 text-xs text-fg-dim">{entry.hint}</span>}
                  {index === selected && (
                    <CornerDownLeft className="size-3.5 shrink-0 text-fg-dim" strokeWidth={2} />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
