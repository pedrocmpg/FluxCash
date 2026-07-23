'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/transactions', label: 'Transações', icon: TransactionsIcon },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const nav = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-secondary hover:bg-bg-hover hover:text-text'
            }`}
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 flex-col gap-4 border-r border-border/60 bg-bg-dark p-3 pt-5 md:flex">
        {nav()}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative flex w-64 flex-col gap-4 border-r border-border/60 bg-bg-dark p-3 pt-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium tracking-wide text-text-secondary uppercase">
                Menu
              </span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text"
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

function iconProps(): { width: number; height: number; viewBox: string; fill: string; stroke: string; strokeWidth: number } {
  return { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 };
}

function DashboardIcon(): ReactNode {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function TransactionsIcon(): ReactNode {
  return (
    <svg {...iconProps()}>
      <path d="M7 8h13M7 8l-3-3M7 8l-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 16H4M17 16l3-3M17 16l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
