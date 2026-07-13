import { useToastContext } from '@/contexts/ToastContext';

export function useToast() {
  const { showSuccess, showError, showInfo } = useToastContext();
  return { showSuccess, showError, showInfo };
}
