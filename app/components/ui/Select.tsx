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
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`rounded-[10px] border bg-bg-hover px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            error ? 'border-expense' : 'border-border focus:border-primary'
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
