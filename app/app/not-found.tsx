import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-dark p-8 text-center text-text">
      <h1 className="text-2xl font-bold">Recurso não encontrado</h1>
      <div className="flex gap-4">
        <Link href="/dashboard" className="text-primary hover:underline">
          Ir para o Dashboard
        </Link>
        <Link href="/" className="text-primary hover:underline">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
