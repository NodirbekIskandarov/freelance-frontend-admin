import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

const controlBase = cn(
  'w-full rounded-control border border-line bg-input text-[13px] text-fg placeholder:text-fg-dim',
  'transition-[background-color,border-color,box-shadow] duration-(--dur) ease-soft',
  'outline-none focus-visible:border-primary/60 focus-visible:shadow-(--ring)',
  'disabled:pointer-events-none disabled:opacity-50',
);

/*
 * Izoh/xato uchun JOY DOIM BAND.
 *
 * Ilgari xato paydo bo'lganda maydon ostidagi matn qo'shilib, formadagi
 * qolgan hamma narsa pastga siljirdi — «Saqlash» tugmasi bosilgan
 * joyidan qochib ketardi. Endi 18px doim turadi va faqat ichi to'ladi.
 */
const slotBase = 'mt-1.5 block min-h-[18px] text-xs leading-[18px]';

function Label({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-fg-soft">
      {label}
      {/* Yulduzcha XIRA: u talabni bildiradi, ogohlantirish emas. Qizil
          yulduzcha to'ldirilmagan formani xato bo'lib ko'rsatardi. */}
      {required && (
        <span aria-hidden className="ml-0.5 text-fg-dim">
          *
        </span>
      )}
    </label>
  );
}

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  /** Maydon ostidagi izoh yoki xato matni. */
  hint?: ReactNode;
  error?: string;
  className?: string;
}

interface TextFieldProps
  extends FieldWrapperProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {}

export function TextField({ label, required, hint, error, className, ...props }: TextFieldProps) {
  const id = useId();

  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(controlBase, 'h-[34px] px-3', error && 'border-danger-line')}
        {...props}
      />
      <span id={`${id}-error`} className={cn(slotBase, error ? 'text-danger' : 'text-fg-dim')}>
        {error ?? hint}
      </span>
    </div>
  );
}

interface TextAreaFieldProps
  extends FieldWrapperProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {
  /** Belgilar hisoblagichi uchun (12-rasmdagi "0 / 300"). */
  maxLength?: number;
  value?: string;
}

export function TextAreaField({
  label,
  required,
  hint,
  error,
  className,
  maxLength,
  value,
  ...props
}: TextAreaFieldProps) {
  const id = useId();

  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />

      <div className="relative">
        <textarea
          id={id}
          rows={4}
          maxLength={maxLength}
          value={value}
          aria-invalid={error ? true : undefined}
          className={cn(
            controlBase,
            'resize-none px-3.5 py-3',
            maxLength && 'pb-8',
            error && 'border-danger-line',
          )}
          {...props}
        />

        {maxLength !== undefined && (
          <span className="pointer-events-none absolute right-3.5 bottom-3 text-xs text-fg-dim">
            {value?.length ?? 0} / {maxLength}
          </span>
        )}
      </div>

      <span className={cn(slotBase, error ? 'text-danger' : 'text-fg-dim')}>{error ?? hint}</span>
    </div>
  );
}
