'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, ShoppingCart, Search, Menu, MapPin, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Drawer } from '@/components/ui/Modal';

import { apiClient } from '../lib/api';
import { CartTotalsView, DEMO_CUSTOMER_ID, unwrap } from '../lib/demo';


export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const { data: totals } = useQuery({
    queryKey: ['cart', 'totals'],
    queryFn: async () =>
      unwrap<CartTotalsView>(await apiClient.get(`/cart/customer/${DEMO_CUSTOMER_ID}/totals`)),
    refetchInterval: 15_000,
  });
  const count = totals?.itemCount ?? 0;

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 dark:border-neutral-700/80 bg-white/90 dark:bg-delhi-night/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-delhi-brick text-white shadow-sm" aria-hidden="true">
            <Pill className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold text-neutral-900 dark:text-delhi-paper">
              GenericQuick <span className="text-delhi-brick">NCR</span>
            </span>
            <span className="block text-[11px] font-medium text-delhi-marigold" lang="hi">
              दिल्ली की अपनी जेनेरिक फार्मेसी
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-50"
          >
            Store
          </Link>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Search medicines"
              aria-expanded={searchOpen}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search medicines...</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-50"
              aria-label="Delivery location"
              aria-expanded={locationOpen}
            >
              <MapPin className="h-4 w-4 text-delhi-brick" aria-hidden="true" />
              <span>Saket, Delhi</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>

            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-neutral-50"
              aria-label={`Cart${count > 0 ? `, ${count} items` : ', empty'}`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence mode="wait">
                {count > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    className="absolute -right-3.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-delhi-brick px-1 text-xs font-bold text-white"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="Menu"
        position="right"
        size="md"
      >
        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            className="px-2 py-3 text-base font-medium text-neutral-900 dark:text-neutral-50 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Store
          </Link>
          <Link
            href="/cart"
            className="px-2 py-3 text-base font-medium text-neutral-900 dark:text-neutral-50 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Cart {count > 0 && `(${count})`}
          </Link>
          <Link
            href="/checkout"
            className="px-2 py-3 text-base font-medium text-neutral-900 dark:text-neutral-50 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Checkout
          </Link>
        </nav>
      </Drawer>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setSearchOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Search medicines"
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search medicines..."
                  className="w-full pl-10 pr-4 py-3 text-base bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                  aria-label="Search medicines"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="mt-3 w-full py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {locationOpen && (
          <motion.div
            key="location-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setLocationOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Delivery location"
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-3">Delivery location</p>
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm text-neutral-900 dark:text-neutral-50 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => setLocationOpen(false)}
                >
                  Saket, Delhi (Current)
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Gurugram, Haryana
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Noida, Uttar Pradesh
                </button>
              </div>
              <button
                type="button"
                onClick={() => setLocationOpen(false)}
                className="mt-3 w-full py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}