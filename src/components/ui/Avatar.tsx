import { useState } from 'react';

import { cn } from '@/lib/cn';

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-10 text-sm',
  xl: 'size-[140px] text-4xl',
} as const;

/**
 * Rasm yo'q bo'lganda ishlatiladigan fon ranglari.
 * Dizaynda harf-avatarlar turli rangda (qizil, binafsha, ko'k, sariq...).
 */
const palette = [
  'bg-danger/80',
  'bg-purple/80',
  'bg-info/80',
  'bg-warning/80',
  'bg-success/80',
  'bg-cyan/80',
  'bg-orange/80',
];

/** Ismdan barqaror rang tanlaydi — bir foydalanuvchi doim bir xil rangda. */
function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1_000_000;
  }
  return palette[hash % palette.length] ?? palette[0]!;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  return first.toUpperCase();
}

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      <img
        src={src ?? undefined}
        alt=""
        onError={() => setFailed(true)}
        className={cn('shrink-0 rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold text-white',
        sizes[size],
        colorFor(name),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
