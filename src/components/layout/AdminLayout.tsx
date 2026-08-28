import { Suspense, useState } from 'react';
import { Navigate, Outlet } from 'react-router';

import { cn } from '@/lib/cn';
import { tokenStore } from '@/store/api';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { localizeHref } from '@/i18n/config';
import { useT } from '@/i18n/I18nProvider';

export function AdminLayout() {
  const { m, locale } = useT();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /*
   * Token yo'q bo'lsa sahifa umuman render qilinmaydi.
   *
   * Faqat 401 javobiga tayanish yetarli emas edi: token'siz ochilgan
   * sahifa avval bo'sh jadval va "0" ko'rsatkichlarni chizib, keyingina
   * login sahifasiga sakrardi. Token bor-yo'g'i esa lokal tekshiruv —
   * haqiqiy ruxsatni backend beradi va yaroqsiz token'da `baseQuery`
   * `onAuthFailure` orqali baribir bu yerga qaytaradi.
   */
  if (!tokenStore.getAccessToken()) {
    return <Navigate to={localizeHref('/login', locale)} replace />;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar className={cn(!sidebarOpen && 'hidden')} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/*
          Bildirishnomalar soni UZATILMAYDI: panelda bildirishnoma API'si
          yo'q va oldingi `5` qat'iy yozilgan, o'ylab topilgan raqam edi.
          Bo'sh qo'ng'iroq — «hozircha hech nima yo'q» degani, yolg'on
          raqam esa har ochilganda tekshirishga majbur qilardi.
        */}
        <Topbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />

        {/* Scroll faqat shu yerda — sidebar va topbar joyida qoladi. */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Suspense
            fallback={
              <div className="grid place-items-center py-24 text-sm text-fg-muted">
                {m.common.loading}
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
