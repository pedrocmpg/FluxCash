import { ReactNode } from 'react';

interface HeaderProps {
  navSlot?: ReactNode;
}

export function Header({ navSlot }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-bg-card px-6 py-4">
      <div className="flex items-center gap-3">
        {navSlot}
        <span className="text-xl font-bold text-primary">FluxCash</span>
      </div>
    </header>
  );
}
