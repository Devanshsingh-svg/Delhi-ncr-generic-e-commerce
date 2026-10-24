'use client';

import { Truck, Shield, HeadphonesIcon, Clock } from 'lucide-react';

const trustItems = [
  {
    icon: Truck,
    title: 'Fast delivery',
    description: 'Delivered in under 60 minutes across Delhi NCR',
  },
  {
    icon: Shield,
    title: 'Genuine medicines',
    description: 'Sourced directly from licensed distributors',
  },
  {
    icon: HeadphonesIcon,
    title: 'Pharmacist support',
    description: 'Licensed pharmacists available for consultation',
  },
  {
    icon: Clock,
    title: '24/7 availability',
    description: 'Order anytime, we are always open',
  },
];

export function TrustSection() {
  return (
    <section className="mt-8 py-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl" aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="sr-only">
        Why choose GenericQuick
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {trustItems.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center p-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-3 transition-transform duration-200 hover:scale-110">
              <item.icon className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-50">{item.title}</h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}