import { useT } from '@/i18n/I18nProvider';
import { Link } from '@/i18n/navigation';

/**
 * 404 endi LAYOUT ICHIDA chiziladi: til bo'lagi bor, lekin sahifa yo'q
 * degani — xodim panelda qoladi va yon menyu joyida turadi.
 */
export function NotFoundPage() {
  const { m } = useT();

  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-text mt-2 text-2xl font-semibold">{m.notFound.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{m.notFound.description}</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          {m.notFound.action}
        </Link>
      </div>
    </div>
  );
}
