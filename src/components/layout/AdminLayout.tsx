import { Suspense, useState } from 'react';
import { Outlet } from 'react-router';

import { cn } from '@/lib/cn';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      <Sidebar className={cn(!sidebarOpen && 'hidden')} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen((open) => !open)} notificationCount={5} />

        {/* Scroll faqat shu yerda — sidebar va topbar joyida qoladi. */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Suspense
            fallback={
              <div className="grid place-items-center py-24 text-sm text-fg-muted">
                Yuklanmoqda…
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
