import { Ban, Check, CircleDot, CircleX, Clock, Minus, X, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Badge foni — accent rangning 15% shaffofligi karta ustida, chegarasiz.
 *
 * Shablondagi admin panelda shunday: dumaloq, chegarasiz, ozgina fonli.
 * Chegara qo'shilsa qatorlar ichida u ikkinchi ramka bo'lib ko'rinardi.
 */
const tones = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  purple: 'bg-purple/15 text-purple',
  orange: 'bg-orange/15 text-orange',
  neutral: 'bg-fg/10 text-fg-muted',
  primary: 'bg-primary/15 text-primary',
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
        'inline-flex items-center gap-1 rounded-badge px-2 py-0.5 text-xs leading-[18px] font-medium whitespace-nowrap',
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
