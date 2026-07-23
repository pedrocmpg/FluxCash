import { ReactNode } from 'react';

interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ header, footer, children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border/60 bg-bg-card shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${className}`}
    >
      {header && <div className="border-b border-border/60 px-5 py-4">{header}</div>}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="border-t border-border/60 px-5 py-4">{footer}</div>}
    </div>
  );
}
