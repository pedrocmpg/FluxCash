import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">FluxCash</h1>
        <p className="mt-1 text-sm text-text-secondary">Crie sua conta</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-text-secondary">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
