'use client';

import { useToastContext } from '@/contexts/ToastContext';

const typeClasses = {
  success: 'border-income/30 bg-bg-card text-income',
  error: 'border-expense/30 bg-bg-card text-expense',
  info: 'border-balance/30 bg-bg-card text-balance',
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)] ${typeClasses[toast.type]}`}
        >
          <span className="text-sm text-text">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-xs text-text-secondary opacity-70 hover:opacity-100"
            aria-label="dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
