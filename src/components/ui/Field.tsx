import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

const controlBase =
  'w-full rounded-control border border-line bg-input text-sm text-fg placeholder:text-fg-dim transition-colors focus:border-primary/60';

function Label({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-fg-soft">
      {label}
      {required && (
        <span aria-hidden className="ml-0.5 text-danger">
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
        className={cn(controlBase, 'h-11 px-3.5', error && 'border-danger')}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-fg-muted">{hint}</p>
      )}
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
            error && 'border-danger',
          )}
          {...props}
        />

        {maxLength !== undefined && (
          <span className="pointer-events-none absolute right-3.5 bottom-3 text-xs text-fg-dim">
            {value?.length ?? 0} / {maxLength}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-fg-muted">{hint}</p>
      )}
    </div>
  );
}
