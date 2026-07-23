import { ReactNode } from 'react';

interface HeaderProps {
  navSlot?: ReactNode;
}

export function Header({ navSlot }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border/60 bg-bg-dark/80 px-6 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {navSlot}
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-bg-dark">
            <LogoMark />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-text">FluxCash</span>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
