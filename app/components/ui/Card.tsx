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
      className={`rounded-[14px] border border-border bg-bg-card shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${className}`}
    >
      {header && <div className="border-b border-border px-5 py-4">{header}</div>}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
    </div>
  );
}
