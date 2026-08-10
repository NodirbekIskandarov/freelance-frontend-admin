import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';

import { router } from '@/app/router';
import { store } from '@/store';

import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('#root elementi topilmadi — index.html tekshirilsin.');
}

/**
 * Mock worker render'dan OLDIN ishga tushadi: aks holda birinchi so'rovlar
 * worker tayyor bo'lgunicha mavjud bo'lmagan backendga ketadi.
 *
 * Shart ataylab shu yerda, o'zgaruvchi orqali emas: `import.meta.env.DEV`
 * build paytida literal `false` ga almashadi, shunda dinamik import
 * erishib bo'lmas shoxga tushadi va MSW chunk umuman yaratilmaydi.
 */
async function prepare(): Promise<void> {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { enableMocking } = await import('@/mocks/browser');
    await enableMocking();
  }
}

void prepare().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>,
  );
});
