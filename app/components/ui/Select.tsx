import { SelectHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = '', children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || props.name || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`rounded-xl border bg-bg-hover px-3 py-2 text-sm text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary/15 ${
            error ? 'border-expense/60' : 'border-border focus:border-primary/50'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-expense">{error}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';
