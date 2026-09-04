import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** O'ngdagi kichik son (16-rasmdagi "Yangi javoblar 2"). */
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Ostidan yashil chiziq bilan ajratiladigan tab'lar (5, 11, 14, 16-rasmlar).
 *
 * `role="tablist"` va o'q tugmalari bilan boshqarish — skrinrider va
 * klaviatura uchun. Native element yo'q, shuning uchun qo'lda beriladi.
 */
export function Tabs({ items, active, onChange, className }: TabsProps) {
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

    event.preventDefault();
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const next = items[(index + offset + items.length) % items.length];
    if (next) onChange(next.id);
  };

  return (
    <div className={cn('border-b border-line-subtle', className)}>
      <div role="tablist" className="flex gap-1 overflow-x-auto">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.id === active;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors',
                isActive ? 'text-primary' : 'text-fg-muted hover:text-fg',
              )}
            >
              {Icon && <Icon className="size-4" strokeWidth={1.75} />}
              {item.label}

              {item.count !== undefined && (
                <span
                  className={cn(
                    'rounded-badge border px-1.5 py-0.5 text-[11px] leading-[16px]',
                    isActive
                      ? 'border-primary-line bg-primary-quiet text-primary'
                      : 'border-neutral-line bg-neutral-quiet text-fg-muted',
                  )}
                >
                  {item.count}
                </span>
              )}

              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
