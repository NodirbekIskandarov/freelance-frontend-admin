import { Link as RouterLink, NavLink as RouterNavLink, useNavigate, useParams } from 'react-router';
import type { ComponentProps } from 'react';

import { DEFAULT_LOCALE, isLocale, localizeHref, type Locale } from './config';

/**
 * Til qo'shadigan havolalar va navigatsiya.
 *
 * Har bir `to` ga qo'lda `/uz` yozish o'nlab joyda takrorlanardi va
 * bittasini unutish sahifani boshqa tilga otib yuborardi — yoki umuman
 * mavjud bo'lmagan manzilga.
 */
function useLocale(): Locale {
  const params = useParams();
  return isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
}

export function Link({
  to,
  ...props
}: Omit<ComponentProps<typeof RouterLink>, 'to'> & { to: string }) {
  const locale = useLocale();
  return <RouterLink to={localizeHref(to, locale)} {...props} />;
}

export function NavLink({
  to,
  ...props
}: Omit<ComponentProps<typeof RouterNavLink>, 'to'> & { to: string }) {
  const locale = useLocale();
  return <RouterNavLink to={localizeHref(to, locale)} {...props} />;
}

/** `useNavigate` ning til qo'shadigan varianti. */
export function useLocaleNavigate() {
  const navigate = useNavigate();
  const locale = useLocale();

  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') return navigate(to);
    return navigate(localizeHref(to, locale), options);
  };
}
