import { Construction } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';

/**
 * Hali qurilmagan sahifalar uchun. Navigatsiyadagi har element ishlashi kerak —
 * aks holda 404 chiqib, karkasni sinab ko'rib bo'lmaydi.
 * Har sahifa tayyor bo'lgach shu o'rniga haqiqiysi qo'yiladi.
 */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} breadcrumbs={[{ label: 'Bosh sahifa', to: '/' }, { label: title }]} />
      <div className="grid place-items-center rounded-card border border-dashed border-line bg-card px-6 py-20 text-center">
        <Construction className="size-8 text-fg-dim" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium text-fg-soft">Bu sahifa hali qurilmagan</p>
        <p className="mt-1 text-sm text-fg-muted">Dizayn bo‘yicha navbati bilan qo‘shiladi.</p>
      </div>
    </>
  );
}
