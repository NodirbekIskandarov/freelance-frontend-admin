import { MoreHorizontal } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { IconButton } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export interface RowAction {
  /** Yorliq — tooltip va `aria-label` uchun. Ikonka yolg'iz hech nima aytmaydi. */
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  /**
   * Halokatli amal: `⋯` menyusining ostki qismiga, ajratuvchi chiziq
   * ostiga tushadi va qizil chiziladi.
   */
  destructive?: boolean;
}

/**
 * Qator amallari: ko'pi bilan ikkitasi ko'rinadi, qolgani `⋯` ichida.
 *
 * Ilgari beshtagacha ikonka yonma-yon turardi — bir xil o'lchamda, bir
 * xil vaznda, va «bloklash» zararsiz «ko'rish» ning yonida edi. Bunday
 * qatorda halokatli amal tasodifan bosiladigan masofada bo'ladi.
 *
 * Endi tartib ma'noli: birinchi ikkitasi kunda o'nlab marta bosiladigan
 * amallar, qolgani — qaror talab qiladiganlari — bir bosish narida.
 */
export function RowActions({
  actions,
  inlineCount = 2,
  className,
}: {
  actions: RowAction[];
  /** Nechtasi tashqarida qolsin. Ikkitadan ko'p qilmang. */
  inlineCount?: number;
  className?: string;
}) {
  const visible = actions.filter((action) => !action.destructive).slice(0, inlineCount);
  const overflow = actions.filter((action) => !visible.includes(action));

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /*
   * Menyu `document.body` ga chiziladi, jadval ichiga emas.
   *
   * Ikki sabab, ikkalasi ham sinovda chiqdi:
   *  — amallar ustuni yopishgan (`sticky`, `z-10`) va HAR qator o'z
   *    stacking konteksti. Menyu qator ichida qolsa, keyingi qatorning
   *    katagi uni bosib qo'yardi: tugma bosilgandek turardi, lekin hech
   *    nima bo'lmasdi.
   *  — jadval o'ramida `overflow-x-auto` bor, ya'ni oxirgi qatorlarda
   *    menyu kesilib qolardi.
   */
  useLayoutEffect(() => {
    if (!open) return;

    function place() {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }

    place();
    // Sahifa siljisa menyu tugmadan ajralib qolmasin — shunchaki yopamiz.
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
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

  if (overflow.length === 0) {
    return (
      <span className={cn('flex items-center justify-end gap-2', className)}>
        {visible.map((action) => (
          <IconButton
            key={action.label}
            label={action.label}
            size="sm"
            disabled={action.disabled}
            onClick={action.onSelect}
          >
            {action.icon}
          </IconButton>
        ))}
      </span>
    );
  }

  const firstDestructive = overflow.findIndex((action) => action.destructive);

  return (
    <div ref={wrapperRef} className={cn('relative flex items-center justify-end gap-2', className)}>
      {visible.map((action) => (
        <IconButton
          key={action.label}
          label={action.label}
          size="sm"
          disabled={action.disabled}
          onClick={action.onSelect}
        >
          {action.icon}
        </IconButton>
      ))}

      <IconButton
        label="Boshqa amallar"
        size="sm"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="size-4" strokeWidth={1.75} />
      </IconButton>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: position.top, right: position.right }}
            className="fixed z-50 min-w-48 rounded-card border border-line bg-card py-1 shadow-dropdown"
          >
            {overflow.map((action, index) => (
              <div key={action.label}>
                {index === firstDestructive && index > 0 && (
                  <div className="my-1 border-t border-line" />
                )}
                <button
                  type="button"
                  role="menuitem"
                  disabled={action.disabled}
                  onClick={() => {
                    setOpen(false);
                    action.onSelect();
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                    'disabled:pointer-events-none disabled:opacity-40',
                    action.destructive
                      ? 'text-danger hover:bg-danger/10'
                      : 'text-fg-soft hover:bg-elevated hover:text-fg',
                  )}
                >
                  <span className="shrink-0">{action.icon}</span>
                  <span className="truncate">{action.label}</span>
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
