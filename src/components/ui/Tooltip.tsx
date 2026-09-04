import {
  cloneElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';

/**
 * Tooltip — ikonkaning nomi.
 *
 * Nega `title` atributi yetarli emas: brauzer uni ~1 soniya kechikish
 * bilan, o'z uslubida va faqat sichqoncha uchun ko'rsatadi. Klaviatura
 * bilan yurgan odam ikonkaning nima qilishini umuman bilmaydi. Bu yerda
 * u fokusda ham chiqadi.
 *
 * PORTAL bilan chiziladi. Jadval qatoridagi amallar ustuni yopishgan
 * (`sticky`) va o'ram `overflow-x-auto` — oddiy `absolute` tooltip
 * o'sha yerda kesilib qolardi.
 */

type Placement = 'top' | 'bottom' | 'left';

const OFFSET = 8;

export function Tooltip({
  label,
  placement = 'top',
  children,
}: {
  label: ReactNode;
  placement?: Placement;
  /** Bitta element: unga hodisa tinglagichlari qo'shiladi. */
  children: ReactElement<Record<string, unknown>>;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  /*
   * O'lchash CHIZILGANDAN keyin: tooltip kengligi matnga bog'liq va uni
   * oldindan bilib bo'lmaydi. `useLayoutEffect` — brauzer bo'yoq
   * bermasdan oldin joyiga qo'yiladi, aks holda u bir kadr chap yuqori
   * burchakda ko'rinib ketardi.
   */
  useLayoutEffect(() => {
    if (!open) return;

    const anchor = anchorRef.current?.getBoundingClientRect();
    const bubble = bubbleRef.current?.getBoundingClientRect();
    if (!anchor || !bubble) return;

    const centerX = anchor.left + anchor.width / 2 - bubble.width / 2;

    const next =
      placement === 'bottom'
        ? { top: anchor.bottom + OFFSET, left: centerX }
        : placement === 'left'
          ? {
              top: anchor.top + anchor.height / 2 - bubble.height / 2,
              left: anchor.left - bubble.width - OFFSET,
            }
          : { top: anchor.top - bubble.height - OFFSET, left: centerX };

    // Ekrandan chiqib ketmasin.
    const margin = 8;
    next.left = Math.min(Math.max(margin, next.left), window.innerWidth - bubble.width - margin);

    setPos(next);
  }, [open, placement, label]);

  /*
   * React 19 da `ref` — ODDIY PROP, ya'ni u `children.props` ichida.
   * `children.ref` orqali o'qish olib tashlangan va konsolga
   * ogohlantirish chiqaradi.
   */
  const childRef = (children.props as { ref?: unknown }).ref;

  const child = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      anchorRef.current = node;
      if (typeof childRef === 'function') childRef(node);
      else if (childRef && typeof childRef === 'object') {
        (childRef as { current: unknown }).current = node;
      }
    },
    'aria-describedby': open ? id : undefined,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  });

  return (
    <>
      {child}
      {open &&
        createPortal(
          <div
            ref={bubbleRef}
            id={id}
            role="tooltip"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
            className={cn(
              'pointer-events-none fixed z-200 rounded-control border border-line bg-elevated px-2.5 py-1.5',
              'text-xs font-medium whitespace-nowrap text-fg shadow-dropdown',
              'motion-safe:animate-[tooltip-in_120ms_var(--ease-soft)]',
            )}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}
