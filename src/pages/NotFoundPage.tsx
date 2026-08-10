import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-text">Sahifa topilmadi</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
