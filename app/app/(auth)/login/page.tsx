import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">FluxCash</h1>
        <p className="mt-1 text-sm text-text-secondary">Entre na sua conta</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-text-secondary">
        Não tem uma conta?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
