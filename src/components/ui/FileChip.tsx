import { FileText, Folder } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { AttachedFile } from '@/shared/types/applications';

/** Format yorlig'ining rangi — dizaynda PDF va JPG turli rangda. */
const formatTones: Record<string, string> = {
  PDF: 'bg-danger/15 text-danger',
  JPG: 'bg-info/15 text-info',
  JPEG: 'bg-info/15 text-info',
  PNG: 'bg-info/15 text-info',
  DOCX: 'bg-info/15 text-info',
  ZIP: 'bg-warning/15 text-warning',
};

/**
 * Biriktirilgan fayl (4-rasm): ikonka + nom + o'ngda format yorlig'i.
 * Fayl haqiqiy manzili bo'lsa havola, bo'lmasa oddiy matn.
 */
export function FileChip({ file, className }: { file: AttachedFile; className?: string }) {
  const tone = formatTones[file.format.toUpperCase()] ?? 'bg-elevated text-fg-muted';

  const content = (
    <>
      <FileText className="size-4 shrink-0 text-success" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate">{file.name}</span>
      <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold', tone)}>
        {file.format.toUpperCase()}
      </span>
    </>
  );

  const base = cn(
    'inline-flex w-full max-w-[220px] items-center gap-2 rounded-control border border-line bg-canvas px-2.5 py-1.5 text-[13px]',
    className,
  );

  if (file.url) {
    return (
      <a href={file.url} target="_blank" rel="noreferrer" className={cn(base, 'hover:bg-elevated')}>
        {content}
      </a>
    );
  }

  return (
    <span className={base} title={file.name}>
      {content}
    </span>
  );
}

/** "3 ta fayl" — portfolio ustuni uchun (4-rasm). */
export function FolderCount({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-control border border-line bg-canvas px-2.5 py-1.5 text-[13px] whitespace-nowrap',
        className,
      )}
    >
      <Folder className="size-4 shrink-0 text-success" strokeWidth={1.75} />
      {count} ta fayl
    </span>
  );
}
