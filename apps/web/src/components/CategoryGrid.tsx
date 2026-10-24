'use client';

import { Pill, Droplet, Pill as PillIcon, Tablets, Syringe, Circle } from 'lucide-react';

const categories = [
  { id: 'tablets', label: 'Tablets', icon: Tablets, href: '?form=tablet' },
  { id: 'capsules', label: 'Capsules', icon: Circle, href: '?form=capsule' },
  { id: 'syrups', label: 'Syrups', icon: Droplet, href: '?form=syrup' },
  { id: 'injections', label: 'Injections', icon: Syringe, href: '?form=injection' },
  { id: 'drops', label: 'Eye/Ear Drops', icon: PillIcon, href: '?form=drops' },
  { id: 'creams', label: 'Creams & Ointments', icon: Pill, href: '?form=cream' },
];

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
        Browse by category
      </h2>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => { window.location.href = category.href; }}
            className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={`Browse ${category.label}`}
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-200"
            >
              <category.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-center">
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}