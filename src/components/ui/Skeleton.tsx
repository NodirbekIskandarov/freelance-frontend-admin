import { cn } from '@/lib/cn';

/**
 * Yuklanish o'rni.
 *
 * Ilgari bu `animate-pulse bg-elevated` bo'lib har joyda qo'lda
 * yozilardi va `Topshiriqlar` sahifasida kulrang yo'l-yo'l blok bo'lib
 * chiqib, chizishdagi xatoga o'xshab ko'rinardi.
 *
 * Yaltirash `prefers-reduced-motion` da o'chadi — u yerda oddiy tinch
 * sirt qoladi.
 */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn('block rounded-control bg-skeleton', className)} />;
}

/** Matn qatori uchun — balandligi shrift qatoriga teng. */
export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn('h-4 rounded-xs', className)} />;
}
