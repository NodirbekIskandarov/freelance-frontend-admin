import { MoreHorizontal } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';

import { IconButton } from '@/components/ui/Button';
import { Menu } from '@/components/ui/Menu';
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>
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

      {overflow.length > 0 && (
        <>
          <IconButton
            ref={triggerRef}
            label="Boshqa amallar"
            size="sm"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((value) => !value)}
          >
            <MoreHorizontal className="size-4" strokeWidth={1.75} />
          </IconButton>

          <Menu
            open={open}
            onClose={() => setOpen(false)}
            anchorRef={triggerRef}
            items={overflow.map((action) => ({
              label: action.label,
              icon: action.icon,
              onSelect: action.onSelect,
              disabled: action.disabled,
              destructive: action.destructive,
            }))}
          />
        </>
      )}
    </div>
  );
}
