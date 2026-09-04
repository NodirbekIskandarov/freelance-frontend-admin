import { Ban, Check, CircleDot, CircleX, Clock, Minus, X, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Badge — TO'LDIRILMAGAN.
 *
 * Uch qatlam: 12% fon, 22% chegara va to'yingan matn. Ilgari ular
 * to'ldirilgan edi va zich jadvalda olti xil to'yingan tamg'a qatorlarni
 * o'qishga xalaqit berardi — holat ustuni sahifadagi eng baland ovozli
 * narsa bo'lib qolgandi. Chegara esa fonni belgilaydi va shu bilan
 * to'ldirishning o'rnini bosadi.
 *
 * Ohanglar soni beshta + aksent. Boshqasi yo'q: `purple`, `orange` va
 * `cyan` 1-fazada olib tashlangan.
 */
const tones = {
  primary: 'bg-primary-quiet text-primary border-primary-line',
  success: 'bg-success-quiet text-success border-success-line',
  warning: 'bg-warning-quiet text-warning border-warning-line',
  danger: 'bg-danger-quiet text-danger border-danger-line',
  info: 'bg-info-quiet text-info border-info-line',
  neutral: 'bg-neutral-quiet text-fg-muted border-neutral-line',
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        // Bitta o'lcham hamma joyda: ilgari 11px va 13px badge'lar bir
        // qatorda uchrab, ular boshqa-boshqa narsadek ko'rinardi.
        'inline-flex items-center gap-1 rounded-badge border px-2 py-0.5',
        'text-[11px] leading-[16px] font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Matn holatidan badge rangini bir joyda aniqlaydi. */
const statusTones: Record<string, BadgeTone> = {
  Faol: 'success',
  Tasdiqlangan: 'success',
  Yangi: 'info',
  Kutilmoqda: 'warning',
  Kutilyapti: 'warning',
  Tasdiqlashda: 'info',
  'Vaqtinchalik bloklangan': 'warning',
  Bloklangan: 'danger',
  'Rad etilgan': 'danger',
  Arxivlangan: 'danger',
  Variantli: 'success',
  Variantsiz: 'warning',
};

/**
 * Holat ikonkasi — RANGGA emas, ma'noga qarab.
 *
 * Rang yolg'iz yetarli emas: rang ko'rmaydigan odam uchun «Faol» va
 * «Bloklangan» bir xil kulrang yorliq, va qora-oq chop etilgan ekranda
 * ham shunday. Ikonka farqni rangdan mustaqil qiladi.
 */
const statusIcons: Record<string, LucideIcon> = {
  Faol: CircleDot,
  Tasdiqlangan: Check,
  Variantli: Check,
  Yangi: CircleDot,
  Tasdiqlashda: Clock,
  Kutilmoqda: Clock,
  Kutilyapti: Clock,
  Variantsiz: Minus,
  'Vaqtinchalik bloklangan': Clock,
  Bloklangan: Ban,
  'Rad etilgan': CircleX,
  Arxivlangan: Minus,
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const Icon = statusIcons[status];

  return (
    <Badge tone={statusTones[status] ?? 'neutral'} className={className}>
      {Icon && <Icon className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />}
      {status}
    </Badge>
  );
}

/**
 * Tasdiqlangan / tasdiqlanmagan.
 *
 * Ikkalasi ham chizilishi SHART: faqat tasdiqlanganini ko'rsatib,
 * qolganini bo'sh qoldirish «ma'lumot yo'q» bilan «tasdiqlanmagan» ni
 * bir xil ko'rsatardi. Ikonka ham bor — ilgari farq faqat rangda edi va
 * zich jadvalda yashil bilan kulrangni bir qarashda ajratib bo'lmasdi.
 */
export function VerificationBadge({
  label,
  verified,
  className,
}: {
  label: string;
  verified: boolean;
  className?: string;
}) {
  return (
    <Badge tone={verified ? 'success' : 'neutral'} className={className}>
      {verified ? (
        <Check className="size-3 shrink-0" strokeWidth={3} aria-hidden />
      ) : (
        <X className="size-3 shrink-0 opacity-70" strokeWidth={3} aria-hidden />
      )}
      <span className="sr-only">{verified ? 'tasdiqlangan' : 'tasdiqlanmagan'}: </span>
      {label}
    </Badge>
  );
}
