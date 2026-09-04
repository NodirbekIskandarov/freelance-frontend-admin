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
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
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

  const label = t((m) => m.locale.ariaSwitch, {
    from: LOCALE_LABELS[locale],
    to: LOCALE_LABELS[next],
  });

  return (
    <Tooltip label={label}>
      <Button
        variant="secondary"
        size="sm"
        aria-label={label}
        icon={<Globe className="size-3.5" strokeWidth={1.75} />}
        onClick={() => {
          rememberLocale(next);
          void navigate(`${localizeHref(stripLocale(pathname), next)}${search}${hash}`);
        }}
      >
        {LOCALE_SHORT_LABELS[locale]}
      </Button>
    </Tooltip>
  );
}
