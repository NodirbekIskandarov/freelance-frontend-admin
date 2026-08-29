import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { applyTheme } from '@/lib/theme';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';

import { router } from '@/app/router';
import { store } from '@/store';

import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('#root elementi topilmadi — index.html tekshirilsin.');
}

// `index.html` dagi skript birinchi kadrni to'g'ri chizadi; bu esa
// tanlovni modul holatiga ham bog'laydi (tizim sozlamasi keyin
// o'zgarsa `system` rejimi unga ergashishi kerak).
applyTheme();

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
