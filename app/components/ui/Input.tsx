import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-xl border bg-bg-hover px-3 py-2 text-sm text-text placeholder:text-text-secondary/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/15 ${
            error ? 'border-expense/60' : 'border-border focus:border-primary/50'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-expense">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
