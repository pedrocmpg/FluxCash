import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/contexts/ToastContext';
import { QueryProvider } from '@/contexts/QueryProvider';
import { ToastContainer } from '@/components/ui/Toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FluxCash',
  description:
    'Gestão financeira pessoal com categorização automática e acompanhamento de investimentos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-dark text-text">
        <QueryProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
