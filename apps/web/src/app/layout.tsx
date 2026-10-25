import type { Metadata } from 'next';
import { Baloo_2, Mukta } from 'next/font/google';
import './globals.css';

import { SiteHeader } from '../components/SiteHeader';

import { Providers } from './providers';

const displayFont = Baloo_2({
  subsets: ['latin', 'devanagari'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = Mukta({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GenericQuick NCR — दिल्ली की अपनी जेनेरिक फार्मेसी',
  description:
    'Hyperlocal medicine e-commerce for Delhi NCR — compare generics with branded alternatives, transparent prices, delivered in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${displayFont.variable} ${bodyFont.variable}`}>
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
