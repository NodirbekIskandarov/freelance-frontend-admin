import { Check, Info, TriangleAlert, X } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/cn';
import { dismissToast, getToasts, subscribeToToasts, type ToastTone } from '@/lib/toast';

const tones: Record<ToastTone, { className: string; icon: typeof Check }> = {
  success: { className: 'border-success-line bg-success-quiet text-success', icon: Check },
  danger: { className: 'border-danger-line bg-danger-quiet text-danger', icon: TriangleAlert },
  info: { className: 'border-info-line bg-info-quiet text-info', icon: Info },
};

/**
 * Xabarnomalar — o'ng pastda.
 *
 * Nega kerak: saqlangan-saqlanmagani ilgari faqat modalning yopilishi
 * bilan bilinardi. Yopilish esa bekor qilishda ham sodir bo'ladi, ya'ni
 * ikkalasi bir xil ko'rinardi.
 */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToToasts, getToasts, getToasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-200 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const tone = tones[toast.tone];
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-control border bg-elevated px-3.5 py-3 shadow-dropdown',
              'motion-safe:animate-[toast-in_160ms_var(--ease-soft)]',
            )}
          >
            <span
              className={cn(
                'grid size-5 shrink-0 place-items-center rounded-full border',
                tone.className,
              )}
            >
              <Icon className="size-3" strokeWidth={2.5} aria-hidden />
            </span>

            <p className="min-w-0 flex-1 text-[13px] text-fg-soft">{toast.message}</p>

            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Yopish"
              className="-mt-0.5 -mr-1 grid size-6 shrink-0 place-items-center rounded-control text-fg-dim transition-colors hover:bg-surface-hover hover:text-fg"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
