import { ChevronRight, LayoutList, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/cn';
import { formatSom } from '@/lib/format';
import type { SubmissionInstitute } from '@/shared/types/submissions';

/**
 * 17 va 18-rasmlardagi chap panel.
 *
 * Fanlar sahifasidagi `InstitutePanel` dan farqi: bu yerda qatorlar ancha
 * ixcham (faqat qisqartma + son), birinchi qator "Barchasi", oxirgisi
 * "Boshqa institutlar" — ikkalasi ham institut emas, yig'ma ko'rinish.
 */
export function SubmissionInstitutePanel({
  items,
  selectedId,
  onSelect,
  isLoading,
}: {
  items: SubmissionInstitute[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}) {
  const [search, setSearch] = useState('');

  const visible = search
    ? items.filter((item) => item.short.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <Card className="flex w-full flex-col p-5 xl:w-[300px] xl:shrink-0">
      <h2 className="text-base font-semibold text-fg">Institutlar</h2>

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mt-4"
      />

      <div className="mt-4 flex flex-col gap-1">
        {isLoading
          ? Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="h-11 animate-pulse rounded-control bg-elevated" />
            ))
          : visible.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center gap-2.5 rounded-control border px-3 py-2 text-left transition-colors',
                    isSelected
                      ? 'border-primary/50 bg-primary/8'
                      : 'border-transparent hover:bg-elevated',
                  )}
                >
                  {item.isAll ? (
                    <Sparkles className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
                  ) : item.isOther ? (
                    <LayoutList className="size-5 shrink-0 text-fg-muted" strokeWidth={1.75} />
                  ) : (
                    <Avatar name={item.short} size="sm" className="size-6" />
                  )}

                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-sm',
                      isSelected ? 'font-medium text-primary' : 'text-fg-soft',
                    )}
                  >
                    {item.short}
                  </span>

                  <span
                    className={cn(
                      'shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium',
                      isSelected ? 'bg-primary/15 text-primary' : 'bg-elevated text-fg-muted',
                    )}
                  >
                    {formatSom(item.count)}
                  </span>

                  <ChevronRight className="size-4 shrink-0 text-fg-dim" strokeWidth={2} />
                </button>
              );
            })}
      </div>
    </Card>
  );
}
