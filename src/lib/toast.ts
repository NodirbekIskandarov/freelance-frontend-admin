/**
 * Xabarnoma (toast) — juda kichik tashqi do'kon.
 *
 * Kutubxona olinmadi: kerak bo'lgani bitta navbat, bitta taymer va
 * obuna. React holatida saqlansa, uni chaqirmoqchi bo'lgan har bir
 * komponent kontekstga bog'lanishi kerak bo'lardi — modal ichidan
 * chaqirish esa aynan shu joyda noqulay.
 */

export type ToastTone = 'success' | 'danger' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
}

const LIFETIME_MS = 4000;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeToToasts(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getToasts(): Toast[] {
  return toasts;
}

export function dismissToast(id: number): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function showToast(message: string, tone: ToastTone = 'success'): void {
  const id = nextId++;
  toasts = [...toasts, { id, tone, message }];
  emit();
  // Xabar o'zi ketadi: uni yopish uchun bosish MAJBURIY bo'lsa, u
  // ishning o'rtasida yana bitta ish bo'lib qolardi.
  setTimeout(() => dismissToast(id), LIFETIME_MS);
}
