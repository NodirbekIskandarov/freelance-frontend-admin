import { NavLink, Outlet } from 'react-router';

/**
 * Vaqtinchalik karkas — `design/admin/` dagi dizayn kelgach
 * to'liq qayta yoziladi. Hozircha marshrutlar ishlashini ko'rsatadi.
 */
const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Foydalanuvchilar' },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-dvh">
      <aside className="w-60 shrink-0 border-r border-border bg-surface">
        <div className="px-5 py-6 text-lg font-semibold text-text">Admin</div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-control px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
