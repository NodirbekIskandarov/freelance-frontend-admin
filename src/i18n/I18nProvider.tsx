import { createContext, use, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router';

import { DEFAULT_LOCALE, isLocale, type Locale } from './config';
import { interpolate } from './interpolate';
import { ru } from './messages/ru';
import { uz, type Messages } from './messages/uz';

/**
 * Tarjimalarni daraxt bo'ylab tarqatish.
 *
 * Ikkala lug'at ham STATIK import qilingan: panel ichki vosita, kunlik
 * foydalanuvchilari o'nlab kishi va lug'atlar bir necha kilobayt.
 * Dinamik yuklash bu yerda faqat kutish holatini va qo'shimcha kodni
 * olib kelardi.
 *
 * Til MANZILDAN (`/:locale`) o'qiladi — bitta manba, sahifa yangilanganda
 * ham o'zgarmaydi.
 */
const DICTIONARIES: Record<Locale, Messages> = { uz, ru };

interface I18nValue {
  locale: Locale;
  m: Messages;
  t: (pick: (messages: Messages) => string, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  const value = useMemo<I18nValue>(() => {
    const m = DICTIONARIES[locale];

    return {
      locale,
      m,
      t: (pick, values) => interpolate(pick(m), values),
    };
  }, [locale]);

  return <I18nContext value={value}>{children}</I18nContext>;
}

/**
 * Matn olish: `const { m } = useT()` → `m.nav.dashboard`.
 *
 * Kalit MATN sifatida emas, maydon sifatida olinadi — noto'g'ri yozilgan
 * kalitni TypeScript build paytida tutadi.
 */
export function useT(): I18nValue {
  const value = use(I18nContext);

  if (!value) {
    throw new Error('useT faqat <I18nProvider> ichida ishlaydi.');
  }

  return value;
}
