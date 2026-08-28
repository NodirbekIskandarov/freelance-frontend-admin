import { Globe } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import {
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  localizeHref,
  rememberLocale,
  stripLocale,
} from '@/i18n/config';
import { useT } from '@/i18n/I18nProvider';

/**
 * Til tanlagich — UZ / RU.
 *
 * Til manzilning bir qismi, shuning uchun almashtirish = boshqa manzilga
 * o'tish. JORIY sahifada qolamiz va so'rov parametrlarini (filtr, sahifa
 * raqami) saqlaymiz: bosh sahifaga otib yuborish xodimning ishini
 * yo'qotardi.
 *
 * Ikkitagina til bor — ochiladigan ro'yxat o'rniga navbatdagisiga
 * almashtiradigan tugma.
 *
 * Bu yerda ATAYLAB oddiy `useNavigate`: manzil allaqachon YANGI til
 * bilan to'liq yig'ilgan, til qo'shadigan variant esa unga joriy tilni
 * yana qo'shib qo'yardi.
 */
export function LocaleToggle() {
  const { locale, t } = useT();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]!;

  return (
    <button
      type="button"
      aria-label={t((m) => m.locale.ariaSwitch, {
        from: LOCALE_LABELS[locale],
        to: LOCALE_LABELS[next],
      })}
      onClick={() => {
        rememberLocale(next);
        void navigate(`${localizeHref(stripLocale(pathname), next)}${search}${hash}`);
      }}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-control px-2.5 text-xs font-semibold text-fg-muted transition-colors hover:bg-elevated hover:text-fg"
    >
      <Globe className="size-4" strokeWidth={1.75} />
      <span className="min-w-[1.5rem]">{LOCALE_SHORT_LABELS[locale]}</span>
    </button>
  );
}
