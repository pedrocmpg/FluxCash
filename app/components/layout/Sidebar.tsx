'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transações' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-4 border-r border-border bg-bg-card p-4 md:flex">
      {user && (
        <div className="border-b border-border pb-4 text-sm text-text-secondary">{user.email}</div>
      )}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[10px] px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
