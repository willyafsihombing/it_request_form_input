import type { Metadata } from 'next';
import './globals.css';
import DialogProvider from '@/components/ui/DiaologProvider';

export const metadata: Metadata = {
  title: 'IT Request Dashboard — Resource Group',
  description: 'Information Technology Request Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
