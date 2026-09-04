import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  /** Halokatli amal — ajratgichdan keyin, qizil chiziladi. */
  destructive?: boolean;
}

/**
 * Ochiladigan menyu — bitta joyda.
 *
 * Ilgari bu mantiq `RowActions` ichida yashagan va boshqa joyda menyu
 * kerak bo'lganda qaytadan yozilishi kerak edi.
 *
 * `document.body` ga PORTAL bilan chiziladi. Ikki sabab, ikkalasi ham
 * sinovda chiqqan:
 *  — jadvalning amallar ustuni yopishgan (`sticky`, `z-10`) va har qator
 *    o'z stacking konteksti. Menyu qator ichida qolsa, keyingi qatorning
 *    katagi uni bosib qo'yardi.
 *  — jadval o'ramida `overflow-x-auto` bor, ya'ni oxirgi qatorlarda menyu
 *    kesilib qolardi.
 */
export function Menu({
  open,
  onClose,
  anchorRef,
  items,
  align = 'right',
  className,
}: {
  open: boolean;
  onClose: () => void;
  /** Menyu shu elementning ostiga qo'yiladi. */
  anchorRef: React.RefObject<HTMLElement | null>;
  items: MenuItem[];
  align?: 'left' | 'right';
  className?: string;
}) {
  const [position, setPosition] = useState<{ top: number; left?: number; right?: number }>({
    top: 0,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;

    function place() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition(
        align === 'right'
          ? { top: rect.bottom + 4, right: window.innerWidth - rect.right }
          : { top: rect.bottom + 4, left: rect.left },
      );
    }

    place();
    // Sahifa siljisa menyu tugmadan ajralib qolmasin — shunchaki yopamiz.
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [open, align, anchorRef, onClose]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  const firstDestructive = items.findIndex((item) => item.destructive);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={position}
      className={cn(
        'fixed z-100 min-w-48 rounded-control border border-line bg-elevated py-1 shadow-dropdown',
        'motion-safe:animate-[menu-in_120ms_var(--ease-soft)]',
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={item.label}>
          {index === firstDestructive && index > 0 && (
            <div className="my-1 border-t border-line-subtle" />
          )}
          <button
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              onClose();
              item.onSelect();
            }}
            className={cn(
              'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm',
              'transition-colors duration-(--dur) ease-soft',
              'disabled:pointer-events-none disabled:opacity-40',
              item.destructive
                ? 'text-danger hover:bg-danger-quiet'
                : 'text-fg-soft hover:bg-surface-hover hover:text-fg',
            )}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
