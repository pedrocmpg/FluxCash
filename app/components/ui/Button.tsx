import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-bg-dark hover:bg-primary-hover font-semibold shadow-[0_1px_0_rgba(255,255,255,0.15)_inset]',
  secondary: 'bg-bg-hover border border-border text-text hover:bg-border/60 font-medium',
  danger: 'bg-expense/15 text-expense border border-expense/30 hover:bg-expense/25 font-medium',
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          role="status"
          aria-label="loading"
        />
      )}
      {children}
    </button>
  );
}
