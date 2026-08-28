/**
 * Tillar va URL bilan bog'liq qoidalar.
 *
 * Til manzilning birinchi bo'lagida (`/uz/dashboard`). Panel ichki
 * vosita bo'lsa ham manzil yagona manba: xodim havolani hamkasbiga
 * yuborganda u qaysi tilda ochilishini bilishi kerak, va sahifa
 * yangilanganda til o'zgarib ketmasligi kerak.
 */

export const LOCALES = ['uz', 'ru'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'uz';

/** Tanlov brauzerda shu nom bilan saqlanadi. */
export const LOCALE_STORAGE_KEY = 'admin.locale';

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function localeFromPathname(pathname: string): Locale | null {
  const first = pathname.split('/')[1];
  return isLocale(first) ? first : null;
}

/** Manzilga til qo'shish. Tashqi havolalar tegilmaydi. */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith('/')) return href;

  const existing = localeFromPathname(href);
  if (existing === locale) return href;
  if (existing) return `/${locale}${href.slice(existing.length + 1) || '/'}`;

  return href === '/' ? `/${locale}` : `/${locale}${href}`;
}

/** Manzildan til bo'lagini olib tashlash. */
export function stripLocale(pathname: string): string {
  const locale = localeFromPathname(pathname);
  if (!locale) return pathname;

  return pathname.slice(locale.length + 1) || '/';
}

export const LOCALE_TAGS: Record<Locale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
};

export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  uz: 'UZ',
  ru: 'RU',
};

/**
 * Boshlang'ich til: manzil → saqlangan tanlov → brauzer → `uz`.
 *
 * Manzil birinchi, chunki havola bilan kelgan odam aynan o'sha tilni
 * so'ragan.
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const fromPath = localeFromPathname(window.location.pathname);
  if (fromPath) return fromPath;

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored ?? undefined)) return stored as Locale;
  } catch {
    // Shaxsiy rejimda o'qish ham xato berishi mumkin.
  }

  const base = navigator.language?.split('-')[0];
  return isLocale(base) ? base : DEFAULT_LOCALE;
}

export function rememberLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Saqlab bo'lmasa ham joriy seans uchun til ishlaydi.
  }
}
