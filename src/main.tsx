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

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
