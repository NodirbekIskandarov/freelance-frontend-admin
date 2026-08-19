import { ChevronRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/cn';
import { formatSom } from '@/lib/format';
import type { SubmissionUniversity } from '@/shared/types/submissions';

/**
 * Chap panel: institutlar va ularning javob soni.
 *
 * "Barchasi" qatori institut emas — u bugungi javoblar ko'rinishiga
 * qaytaradi, shuning uchun ro'yxatga qo'shilmay, alohida chiziladi.
 */
export function SubmissionUniversityPanel({
  items,
  selectedId,
  onSelect,
  isLoading,
}: {
  items: SubmissionUniversity[];
  selectedId: string;
  onSelect: (id: string) => void;
  isLoading?: boolean;
}) {
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const visible = query
    ? items.filter(
        (item) =>
          item.short_name.toLowerCase().includes(query) || item.name.toLowerCase().includes(query),
      )
    : items;

  const total = items.reduce((sum, item) => sum + item.submitted_count, 0);

  return (
    <Card className="flex w-full flex-col p-5 xl:w-[300px] xl:shrink-0">
      <h2 className="text-base font-semibold text-fg">Institutlar</h2>

      <SearchInput
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mt-4"
      />

      <div className="mt-4 flex flex-col gap-1">
        <button
          type="button"
          onClick={() => onSelect('all')}
          aria-pressed={selectedId === 'all'}
          className={cn(
            'flex items-center gap-2.5 rounded-control border px-3 py-2 text-left transition-colors',
            selectedId === 'all'
              ? 'border-primary/50 bg-primary/8'
              : 'border-transparent hover:bg-elevated',
          )}
        >
          <Sparkles className="size-5 shrink-0 text-primary" strokeWidth={1.75} />
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-sm',
              selectedId === 'all' ? 'font-medium text-primary' : 'text-fg-soft',
            )}
          >
            Barchasi
          </span>
          <span
            className={cn(
              'shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium',
              selectedId === 'all' ? 'bg-primary/15 text-primary' : 'bg-elevated text-fg-muted',
            )}
          >
            {formatSom(total)}
          </span>
        </button>

        {isLoading
          ? Array.from({ length: 8 }, (_, index) => (
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
                  title={item.name}
                  className={cn(
                    'flex items-center gap-2.5 rounded-control border px-3 py-2 text-left transition-colors',
                    isSelected
                      ? 'border-primary/50 bg-primary/8'
                      : 'border-transparent hover:bg-elevated',
                  )}
                >
                  <Avatar name={item.short_name || item.name} size="sm" className="size-6" />

                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-sm',
                      isSelected ? 'font-medium text-primary' : 'text-fg-soft',
                    )}
                  >
                    {item.short_name || item.name}
                  </span>

                  <span
                    className={cn(
                      'shrink-0 rounded-badge px-2 py-0.5 text-xs font-medium',
                      isSelected ? 'bg-primary/15 text-primary' : 'bg-elevated text-fg-muted',
                    )}
                  >
                    {formatSom(item.submitted_count)}
                  </span>

                  <ChevronRight className="size-4 shrink-0 text-fg-dim" strokeWidth={2} />
                </button>
              );
            })}
      </div>
    </Card>
  );
}
