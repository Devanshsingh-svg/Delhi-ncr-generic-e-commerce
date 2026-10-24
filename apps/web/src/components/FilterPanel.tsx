'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';


import { Button } from '@/components/ui/Button';
import { useUniqueDosageForms } from '@/hooks/useCatalogFilters';

import { CatalogItem } from '../lib/demo';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    regulatory: 'all' | 'H' | 'OTC';
    dosageForm: string;
  };
  onRegulatoryChange: (value: 'all' | 'H' | 'OTC') => void;
  onDosageFormChange: (value: string) => void;
  onClear: () => void;
  items: CatalogItem[] | undefined;
  hasActiveFilters: boolean;
}

const regulatoryOptions = [
  { value: 'all' as const, label: 'All medicines', count: (items: CatalogItem[] | undefined) => items?.length ?? 0 },
  { value: 'OTC' as const, label: 'OTC', count: (items: CatalogItem[] | undefined) => items?.filter((i) => i.regulatoryCode !== 'H').length ?? 0 },
  { value: 'H' as const, label: 'Prescription (Rx)', count: (items: CatalogItem[] | undefined) => items?.filter((i) => i.regulatoryCode === 'H').length ?? 0 },
];

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onRegulatoryChange,
  onDosageFormChange,
  onClear,
  items,
  hasActiveFilters,
}: FilterPanelProps) {
  const dosageForms = useUniqueDosageForms(items);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden"
      role="region"
      aria-label="Search filters"
    >
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Filters</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Close filters"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        <fieldset>
          <legend className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3">Regulatory</legend>
          <div className="space-y-2">
            {regulatoryOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center justify-between cursor-pointer rounded-lg border p-3 transition-all
                  ${filters.regulatory === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="regulatory"
                    value={option.value}
                    checked={filters.regulatory === option.value}
                    onChange={() => onRegulatoryChange(option.value)}
                    className="h-4 w-4 accent-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-50">{option.label}</span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      {option.count(items)} medicines
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {dosageForms.length > 0 && (
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3">Dosage form</legend>
            <div className="flex flex-wrap gap-2">
              {['all', ...dosageForms].map((form) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => onDosageFormChange(form)}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-full transition-all
                    ${filters.dosageForm === form
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }
                  `}
                  aria-pressed={filters.dosageForm === form}
                >
                  {form === 'all' ? 'All forms' : form}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-neutral-200 dark:border-neutral-700"
          >
            <Button variant="ghost" size="sm" onClick={onClear} leftIcon={<X className="h-4 w-4" aria-hidden="true" />}>
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}