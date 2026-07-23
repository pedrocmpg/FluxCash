'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transações' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const nav = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col gap-4 border-r border-border bg-bg-card p-4 md:flex">
        {nav()}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative flex w-64 flex-col gap-4 border-r border-border bg-bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary">Menu</span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={onClose}
                className="text-text-secondary hover:text-text"
              >
                ✕
              </button>
            </div>
            {nav(onClose)}
          </aside>
        </div>
      )}
    </>
  );
}
