'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-bg-card px-6 py-4">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-primary">FluxCash</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-text-secondary">{user.email}</span>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      )}
    </header>
  );
}
