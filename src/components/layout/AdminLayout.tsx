import { Suspense, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { localizeHref } from '@/i18n/config';
import { useT } from '@/i18n/I18nProvider';
import { cn } from '@/lib/cn';
import { tokenStore } from '@/store/api';

import { CommandPalette } from './CommandPalette';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/** Yon menyu kontent YONIDA sig'adigan kenglik. */
const DESKTOP = '(min-width: 1024px)';

/**
 * Ekran keng-tor ekanini kuzatadi.
 *
 * `useSyncExternalStore`, effekt emas: qiymat brauzerda va uni effektda
 * o'qib holatga yozish qo'shimcha render tug'diradi. Loyihadagi tema va
 * til tanlagichlari ham shu naqshda.
 */
function useIsDesktop(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(DESKTOP);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

export function AdminLayout() {
  const { m, locale } = useT();
  const { pathname } = useLocation();
  const isDesktop = useIsDesktop();

  /*
   * Telefonda menyu YOPIQ boshlanadi.
   *
   * Ilgari u har doim ochiq edi va 244px kenglik 390px ekranda kontentga
   * atigi ~146px qoldirardi — jadvallar ham, formalar ham siqilib,
   * panelni telefonda ishlatib bo'lmasdi.
   */
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(DESKTOP).matches,
  );

  /*
   * Boshqa sahifaga o'tilganda menyu yopiladi — faqat TELEFONDA.
   *
   * Render paytida, effektda emas: effekt bilan yangi sahifa bir kadr
   * davomida ochiq menyu ostida chizilardi. Kompyuterda menyu joyida
   * qoladi — u kontentni to'smaydi.
   */
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    if (!isDesktop) setSidebarOpen(false);
  }

  /*
    Ctrl/Cmd+K — tezkor qidiruv. 445 fan va 188 variantda menyu bo'ylab
    yurish sekin; klaviatura bilan istalgan sahifaga bir bosishda
    o'tiladi.

    `keydown` hujjatda: fokus qayerda bo'lishidan qat'i nazar ishlashi
    kerak, aks holda jadval ichida turgan odamga yetmasdi.
  */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (!tokenStore.getAccessToken()) {
    return <Navigate to={localizeHref('/login', locale)} replace />;
  }

  /** Telefonda menyu kontent USTIDAN ochiladi — yonida joy yo'q. */
  const isDrawer = !isDesktop;
  const hidden = isDrawer && !sidebarOpen;

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      {/* Ortidagi qatlam: menyu ochiq turganda tashqariga bosish uni
          yopadi — telefonda "orqaga" tugmasidan boshqa yo'l qolmasdi. */}
      {isDrawer && sidebarOpen && (
        <button
          type="button"
          aria-label={m.layout.closeSidebar}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60"
        />
      )}

      {/*
        Kompyuterda menyu YASHIRILMAYDI, 64px chiziqqa yig'iladi.
        Ilgari `lg:hidden` bilan butunlay yo'q bo'lardi va navigatsiya
        qolmasdi — joy bo'shatish uchun bosgan odam har safar uni
        qaytadan ochishga majbur edi.
      */}
      <Sidebar
        aria-hidden={hidden}
        collapsed={isDesktop && !sidebarOpen}
        className={cn(
          'transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:transition-none',
          isDrawer && 'fixed inset-y-0 left-0 z-50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Telefonda yopiq menyu ekrandan tashqarida turadi, lekin
          // DOM'da qoladi — klaviatura fokusi u yerga tushib ketmasin.
          hidden && 'pointer-events-none',
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/*
          Bildirishnomalar soni UZATILMAYDI: panelda bildirishnoma API'si
          yo'q va oldingi `5` qat'iy yozilgan, o'ylab topilgan raqam edi.
          Bo'sh qo'ng'iroq — «hozircha hech nima yo'q» degani, yolg'on
          raqam esa har ochilganda tekshirishga majbur qilardi.
        */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onOpenSearch={() => setPaletteOpen(true)}
        />

        {/* Scroll faqat shu yerda — sidebar va topbar joyida qoladi. */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
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

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
