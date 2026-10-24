import type { Metadata } from 'next';
import './globals.css';

import { SiteHeader } from '../components/SiteHeader';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'GenericQuick NCR',
  description: 'Hyperlocal medicine e-commerce for Delhi NCR',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 dark:bg-neutral-950 antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main-content" className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}