import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Sahifa sarlavhasi. Dizaynda ikki ko'rinishda uchraydi:
 * sarlavha + tavsif (Dashboard) yoki sarlavha + breadcrumb (ro'yxat sahifalari).
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-fg">{title}</h1>

        {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mt-1.5">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-fg-muted">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden className="text-fg-dim">›</span>}
                  {crumb.to ? (
                    <Link to={crumb.to} className="transition-colors hover:text-primary">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-fg-soft">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
