import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { formatDate, formatTime } from '@/lib/format';

/**
 * Sana katagi: kun ustida, soat ostida xira.
 *
 * Bitta qatorda `14.02.2026, 10:00` yozilganda ustun kengayib ketardi va
 * sanalarni ko'z bilan solishtirib bo'lmasdi — kun raqamlari har qatorda
 * boshqa joyda turardi.
 */
export function DateCell({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-fg-dim">—</span>;

  return (
    <span className="block tabular-nums whitespace-nowrap">
      <span className="block text-[13px] text-fg-soft">{formatDate(value)}</span>
      <span className="block text-[11px] text-fg-dim">{formatTime(value)}</span>
    </span>
  );
}

/**
 * Uzun matn — BITTA qator va to'liq matni tooltipda.
 *
 * Ilgari murojaat matni katakni cho'zib, qolgan ustunlarni ekrandan
 * chiqarib yuborardi: bitta uzun xat butun jadvalni o'qib bo'lmas holga
 * keltirardi.
 */
export function TruncatedCell({
  children,
  className,
}: {
  children: string | null | undefined;
  className?: string;
}) {
  const text = children?.trim();
  if (!text) return <span className="text-fg-dim">—</span>;

  return (
    <Tooltip label={text}>
      <span className={cn('block max-w-[28ch] truncate text-[13px] text-fg-soft', className)}>
        {text}
      </span>
    </Tooltip>
  );
}

/** O'ngga tekislangan, tabular raqam — summalar va sanoqlar uchun. */
export function NumberCell({ children }: { children: React.ReactNode }) {
  return <span className="block text-right tabular-nums">{children}</span>;
}
