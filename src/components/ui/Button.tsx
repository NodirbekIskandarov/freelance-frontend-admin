import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
  secondary: 'border border-line bg-card text-fg-soft hover:bg-elevated hover:text-fg',
  danger: 'bg-danger text-white hover:bg-danger/85',
  success: 'bg-success text-white hover:bg-success/85',
  ghost: 'text-fg-muted hover:bg-elevated hover:text-fg',
} as const;

const sizes = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Matndan oldin turadigan ikonka. */
  icon?: ReactNode;
  /** Matndan keyin turadigan element (masalan chevron). */
  trailing?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailing,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-control font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {trailing}
    </button>
  );
}

const iconSizes = {
  sm: 'size-7',
  md: 'size-8',
  lg: 'size-9',
} as const;

/**
 * Jadval qatorlaridagi kvadrat ikonka tugmalari (ko'rish, tahrirlash, o'chirish).
 * Dizaynda ular rangli chegara + shu rangning shaffof foni bilan.
 */
const toneStyles = {
  neutral: 'border-line text-fg-muted hover:bg-elevated hover:text-fg',
  success: 'border-success/30 bg-success/10 text-success hover:bg-success/20',
  warning: 'border-warning/30 bg-warning/10 text-warning hover:bg-warning/20',
  danger: 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
  info: 'border-info/30 bg-info/10 text-info hover:bg-info/20',
} as const;

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: keyof typeof toneStyles;
  size?: keyof typeof iconSizes;
}

export function IconButton({
  label,
  tone = 'neutral',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'grid shrink-0 place-items-center rounded-control border transition-colors disabled:pointer-events-none disabled:opacity-40',
        iconSizes[size],
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
