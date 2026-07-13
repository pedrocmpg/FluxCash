import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-dark p-4">
      <div className="w-full max-w-md rounded-[14px] border border-border bg-bg-card p-8">
        {children}
      </div>
    </div>
  );
}
