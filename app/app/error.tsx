'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-dark p-8 text-center text-text">
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="text-text-secondary">Erro no servidor. Tente novamente.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
