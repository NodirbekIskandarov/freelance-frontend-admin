import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Formadagi maydonlar guruhi.
 *
 * Ilgari modalda sakkizta maydon ketma-ket, 8px oraliq bilan yotardi —
 * qaysi biri majburiy, qaysilari birga o'qilishi kerakligi ko'rinmasdi.
 * Sarlavha va ajratgich ularni ma'noli bo'laklarga bo'ladi: «Asosiy
 * ma'lumot», «Ko'rinish», «Holat».
 *
 * `columns` — QISQA maydonlar uchun (kod, viloyat, tartib raqami). Ism va
 * tavsif doim to'liq kenglikda: ular bir qatorda ikkitalab turганda matn
 * o'rtasida uziladi.
 */
export function FormSection({
  title,
  description,
  columns = false,
  children,
  className,
}: {
  title?: string;
  description?: string;
  /** ≥560px da ikki ustun. */
  columns?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn('border-b border-line-subtle pb-5 last:border-b-0 last:pb-0', className)}
    >
      {title && (
        <div className="mb-3">
          <h3 className="text-[11px] font-medium tracking-[0.08em] text-fg-dim uppercase">
            {title}
          </h3>
          {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
        </div>
      )}

      <div className={cn('grid gap-4', columns && 'sm:grid-cols-2')}>{children}</div>
    </section>
  );
}

/** Ikki ustunli bo'limda butun qatorni egallaydigan maydon uchun. */
export function FormFull({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}
