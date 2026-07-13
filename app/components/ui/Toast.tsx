'use client';

import { useToastContext } from '@/contexts/ToastContext';

const typeClasses = {
  success: 'border-income bg-income/10 text-income',
  error: 'border-expense bg-expense/10 text-expense',
  info: 'border-balance bg-balance/10 text-balance',
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
          className={`flex items-center justify-between gap-4 rounded-[10px] border px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${typeClasses[toast.type]}`}
        >
          <span className="text-sm">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-xs opacity-70 hover:opacity-100"
            aria-label="dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
