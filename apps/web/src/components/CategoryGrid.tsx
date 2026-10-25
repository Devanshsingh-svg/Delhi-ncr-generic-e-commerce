'use client';

import { Droplet, Pill as PillIcon, Tablets, Syringe, Circle } from 'lucide-react';

const categories = [
  { id: 'tablets', label: 'Tablets', icon: Tablets, href: '?form=tablet' },
  { id: 'capsules', label: 'Capsules', icon: Circle, href: '?form=capsule' },
  { id: 'syrups', label: 'Syrups', icon: Droplet, href: '?form=syrup' },
  { id: 'injections', label: 'Injections', icon: Syringe, href: '?form=injection' },
  { id: 'drops', label: 'Eye/Ear Drops', icon: PillIcon, href: '?form=drops' },
  { id: 'creams', label: 'Creams & Ointments', icon: PillIcon, href: '?form=cream' },
];

export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="font-display mb-4 text-lg font-semibold text-neutral-900 dark:text-delhi-paper">
        Browse by category
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              window.location.href = category.href;
            }}
            className="group relative flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-delhi-brick/50 hover:bg-delhi-brick/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-delhi-brick/60 active:scale-95 dark:border-neutral-700/80 dark:bg-delhi-surface dark:hover:border-delhi-brick/60 dark:hover:bg-delhi-brick/10"
            aria-label={`Browse ${category.label}`}
          >
            <div className="relative flex h-12 w-full items-center justify-center">
              {/* Cusped-arch well with finial — the Mughal motif */}
              <span
                className="absolute bottom-0 left-1/2 h-12 w-12 -translate-x-1/2 rounded-t-full border border-neutral-200 bg-neutral-100 transition-colors duration-200 group-hover:border-delhi-brick/40 group-hover:bg-delhi-brick/10 dark:border-neutral-700 dark:bg-neutral-800 dark:group-hover:bg-delhi-brick/15"
                aria-hidden="true"
              />
              <span
                className="absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-delhi-marigold transition-transform duration-200 group-hover:scale-125"
                aria-hidden="true"
              />
              <category.icon
                className="relative z-10 h-5 w-5 text-delhi-brick transition-colors duration-200 group-hover:text-delhi-brick"
                aria-hidden="true"
              />
            </div>
            <span className="text-center text-sm font-medium text-neutral-900 transition-colors duration-200 group-hover:text-delhi-brick dark:text-delhi-paper">
              {category.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
