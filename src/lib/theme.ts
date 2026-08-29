export type ThemeMode = 'light' | 'dark' | 'system';

const KEY = 'admin.theme';
const EVENT = 'yopamiz-admin:theme';

/**
 * Mavzu boshqaruvi.
 *
 * Tanlov `<html data-theme="...">` ga yoziladi, ranglar esa faqat
 * tokenlar qatlamida almashadi — komponentlarning birortasi ham
 * o'zgarmaydi. Shu sababli yorug' mavzu qo'shish bitta CSS bloki, ellik
 * fayl emas.
 *
 * `system` alohida holat, `light` yoki `dark` ga tenglashtirilmaydi:
 * kechqurun tizim qorong'iga o'tsa panel ham o'tishi kerak, ya'ni
 * tanlovning O'ZI saqlanadi, natijasi emas.
 */

function prefersDark(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function read(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Private rejim yoki storage o'chirilgan.
  }
  return 'system';
}

export function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? (prefersDark() ? 'dark' : 'light') : mode;
}

/** Tanlovni DOM'ga qo'llaydi. */
export function applyTheme(mode: ThemeMode = getThemeMode()): void {
  if (typeof document === 'undefined') return;

  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.themeMode = mode;
  // Brauzerning o'z boshqaruvlari (scrollbar, form elementlari) ham
  // ergashsin — aks holda yorug' sahifada qora scrollbar qolardi.
  root.style.colorScheme = resolved;
}

export function getThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return read();
}

export function setThemeMode(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    // Saqlab bo'lmasa ham joriy sahifada almashsin.
  }
  applyTheme(mode);
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Mavzu o'zgarishiga obuna.
 *
 * Uchta manba: shu yorliqdagi almashtirish, boshqa yorliqdagi
 * (`storage`), va tizim sozlamasi — oxirgisi `system` rejimida muhim,
 * chunki u yerda hech kim hech nima bosmasa ham rang almashadi.
 */
export function subscribeToTheme(onChange: () => void): () => void {
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const handleSystem = () => {
    if (getThemeMode() === 'system') applyTheme('system');
    onChange();
  };

  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  media.addEventListener('change', handleSystem);

  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
    media.removeEventListener('change', handleSystem);
  };
}
