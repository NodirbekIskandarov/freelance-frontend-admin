import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Sahifa sarlavhasi — BUTUN panel uchun bitta qolip.
 *
 * Ilgari uch xil edi: ba'zi sahifada breadcrumb sarlavha ostida, ba'zida
 * ustida, Dashboard esa umuman o'z `<h1>` ini chizardi. Bir bo'limdan
 * ikkinchisiga o'tganda sarlavha joyidan siljib turardi va bu har
 * o'tishda ko'zni qayta moslashtirishga majbur qilardi.
 *
 * Tartib qat'iy:
 *   1-qator — breadcrumb (doim ustida, `/` bilan ajratilgan)
 *   2-qator — sarlavha, ixtiyoriy tavsif va o'ngda amallar
 *   3-qator — ixtiyoriy filtr / segment paneli
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  filters,
  className,
}: {
  title: ReactNode;
  /** Bitta qator tavsif. Uzun matn bu yerga tushmaydi. */
  subtitle?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Ko'pi bilan bitta asosiy tugma va bir nechta ikkilamchi. */
  actions?: ReactNode;
  /** Sarlavha ostidagi filtr qatori — jadval ustidagi boshqaruvlar. */
  filters?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-fg-dim">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden className="text-fg-dim/60">
                    /
                  </span>
                )}
                {crumb.to ? (
                  <Link
                    to={crumb.to}
                    className="transition-colors duration-(--dur) ease-soft hover:text-fg-soft"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-fg-muted">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-fg">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {filters && <div className="mt-4">{filters}</div>}
    </div>
  );
}
