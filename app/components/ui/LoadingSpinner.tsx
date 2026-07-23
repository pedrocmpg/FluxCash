interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-16 w-16 border-4',
};

export function LoadingSpinner({ size = 'md', fullscreen = false }: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label="loading"
      className={`animate-spin rounded-full border-t-primary border-border ${sizeClasses[size]}`}
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/90 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
}
