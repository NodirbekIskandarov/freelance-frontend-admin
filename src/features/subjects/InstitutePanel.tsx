import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { cn } from '@/lib/cn';
import { formatSom } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

import { useGetInstitutePanelQuery } from './subjectsApi';

interface InstitutePanelProps {
  selectedId: string;
  onSelect: (id: string) => void;
  title?: string;
}

/**
 * Chapdagi institutlar ro'yxati (10-rasm).
 * Sahifalash panel ichida — o'ng tarafdagi fanlar jadvalidan mustaqil.
 */
export function InstitutePanel({
  selectedId,
  onSelect,
  title = "Institutlar ro'yxati",
}: InstitutePanelProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading } = useGetInstitutePanelQuery({
    page,
    limit: 8,
    search: debouncedSearch || undefined,
  });

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <Card className="flex w-full flex-col p-5 xl:w-[340px] xl:shrink-0">
      <h2 className="text-base font-semibold text-fg">{title}</h2>

      <SearchInput
        iconPosition="right"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        className="mt-4"
      />

      <div className="mt-4 flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-[76px] animate-pulse rounded-card bg-elevated" />
            ))
          : data?.items.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-card border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-primary/50 bg-primary/8'
                      : 'border-line bg-canvas hover:bg-elevated',
                  )}
                >
                  <Avatar name={item.short} src={item.logoUrl} size="lg" />

                  <span className="min-w-0 leading-snug">
                    <span
                      className={cn(
                        'block text-sm font-medium',
                        isSelected ? 'text-primary' : 'text-fg',
                      )}
                    >
                      {item.short}
                    </span>
                    <span className="block truncate text-xs text-fg-muted">{item.name}</span>
                    <span className="mt-0.5 block text-xs text-fg-dim">
                      {item.subjectCount} fan • {formatSom(item.taskCount)} topshiriq
                    </span>
                  </span>
                </button>
              );
            })}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Institutlar sahifalari"
          className="mt-4 flex items-center justify-center gap-1.5"
        >
          {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPage(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'grid size-8 place-items-center rounded-control border text-[13px] font-medium transition-colors',
                item === page
                  ? 'border-primary bg-primary text-white'
                  : 'border-line text-fg-muted hover:bg-elevated hover:text-fg',
              )}
            >
              {item}
            </button>
          ))}

          {totalPages > 3 && (
            <>
              <span className="px-1 text-[13px] text-fg-dim">…</span>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className="grid size-8 place-items-center rounded-control border border-line text-[13px] font-medium text-fg-muted transition-colors hover:bg-elevated hover:text-fg"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            aria-label="Oldingi sahifa"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="grid size-8 place-items-center rounded-control border border-line text-fg-muted transition-colors hover:bg-elevated hover:text-fg disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Keyingi sahifa"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="grid size-8 place-items-center rounded-control border border-line text-fg-muted transition-colors hover:bg-elevated hover:text-fg disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </button>
        </nav>
      )}
    </Card>
  );
}
