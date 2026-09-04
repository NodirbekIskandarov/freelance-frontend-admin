import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';

/**
 * Tugma variantlari.
 *
 * Ekrandagi YAGONA to'ldirilgan to'yingan blok — `primary`. Qolgani
 * shaffof yoki 12% fonli. Ilgari `danger` va `success` ham to'ldirilgan
 * edi va jadval ustidagi uch tugma bir-biri bilan diqqat uchun
 * kurashardi.
 *
 * `primary` aksentning O'ZINI oladi va matn qora (`--color-on-accent`):
 * #10b981 ustida qora 7.3:1, oq esa 2.5:1 beradi. Yorug' mavzuda token
 * teskari — to'q yashil fon, oq matn.
 */
const variants = {
  primary: 'bg-primary text-on-accent hover:bg-primary-hover active:bg-primary-active shadow-card',
  secondary: 'border border-line text-fg-soft hover:bg-surface-hover hover:text-fg',
  ghost: 'text-fg-muted hover:bg-surface-hover hover:text-fg',
  'danger-quiet': 'border border-danger-line bg-danger-quiet text-danger hover:bg-danger/20',
  /*
   * To'ldirilgan halokatli/tasdiqlovchi tugma — FAQAT tasdiq oynasida,
   * u yerda tanlov bittagina va u qaytarib bo'lmaydigan. Ro'yxat
   * ekranlarida `danger-quiet` ishlatiladi.
   */
  danger: 'bg-danger-solid text-white hover:bg-danger-solid/85',
  success: 'bg-success-solid text-white hover:bg-success-solid/85',
} as const;

/** Balandliklar dizayndan: 28 / 34 / 40. */
const sizes = {
  sm: 'h-7 gap-1.5 px-2.5 text-[13px]',
  md: 'h-[34px] gap-2 px-3.5 text-[13px]',
  lg: 'h-10 gap-2 px-4 text-sm',
} as const;

const base = cn(
  'relative inline-flex shrink-0 items-center justify-center rounded-control font-medium whitespace-nowrap',
  'transition-[background-color,border-color,color,box-shadow] duration-(--dur) ease-soft',
  'outline-none focus-visible:shadow-(--ring)',
  'disabled:pointer-events-none disabled:opacity-50',
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Matndan oldin turadigan ikonka. */
  icon?: ReactNode;
  /** Matndan keyin turadigan element (masalan chevron). */
  trailing?: ReactNode;
  /** Yuklanmoqda: aylanma chiqadi va tugma o'chadi. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    trailing,
    loading,
    className,
    children,
    type = 'button',
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {/* Yorliq o'z joyida qoladi — aylanma uning USTIDA chiziladi.
          Almashtirilsa tugma kengligi sakrab ketardi. */}
      {loading && (
        <Loader2 className="absolute size-4 animate-spin motion-reduce:animate-none" aria-hidden />
      )}
      <span
        className={cn(
          'inline-flex items-center',
          sizes[size].includes('gap-2') ? 'gap-2' : 'gap-1.5',
          loading && 'invisible',
        )}
      >
        {icon}
        {children}
        {trailing}
      </span>
    </button>
  );
});

const iconSizes = {
  sm: 'size-7',
  md: 'size-[34px]',
  lg: 'size-10',
} as const;

/**
 * Kvadrat ikonka tugmasi.
 *
 * Ohanglar SHAFFOF: ilgari ular rangli chegara + rangli fon bilan
 * chizilardi va jadval qatorida ikkita kichik rangli kvadrat holat
 * badge'idan ko'ra baland ovozda gapirardi.
 *
 * `label` MAJBURIY va u ikkala joyga ketadi — `aria-label` va tooltip.
 * Yorliqsiz ikonka tugmasi — xato: ikonka yolg'iz o'zi hech nima
 * aytmaydi.
 */
const toneStyles = {
  neutral: 'text-fg-muted hover:bg-surface-hover hover:text-fg',
  success: 'text-success hover:bg-success-quiet',
  warning: 'text-warning hover:bg-warning-quiet',
  danger: 'text-danger hover:bg-danger-quiet',
  info: 'text-info hover:bg-info-quiet',
} as const;

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: keyof typeof toneStyles;
  size?: keyof typeof iconSizes;
  /** Chegara chizilsinmi. Panel boshqaruvlarida — ha, jadval ichida — yo'q. */
  bordered?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    label,
    tone = 'neutral',
    size = 'md',
    bordered = false,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <Tooltip label={label}>
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(
          'grid shrink-0 place-items-center rounded-control',
          'transition-[background-color,border-color,color,box-shadow] duration-(--dur) ease-soft',
          'outline-none focus-visible:shadow-(--ring)',
          'disabled:pointer-events-none disabled:opacity-40',
          bordered && 'border border-line',
          iconSizes[size],
          toneStyles[tone],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
});
