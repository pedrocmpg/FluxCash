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
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-[10px] border bg-bg-hover px-3 py-2 text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            error ? 'border-expense' : 'border-border focus:border-primary'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-expense">{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
