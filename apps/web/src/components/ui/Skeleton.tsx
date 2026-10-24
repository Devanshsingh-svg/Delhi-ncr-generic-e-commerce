'use client';

import { HTMLAttributes, forwardRef, CSSProperties } from 'react';

import { Card } from './Card';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'rectangular',
      width = '100%',
      height,
      lines = 1,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden animate-pulse';
    const lineStyles = 'h-4 w-full rounded animate-pulse bg-neutral-200 dark:bg-neutral-700';

    if (variant === 'card') {
      return (
        <div ref={ref} className={className} {...props}>
          <div className={`${baseStyles} h-40 w-full rounded-xl mb-3`} aria-hidden="true" />
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={lineStyles}
                style={{ width: i === lines - 1 ? '60%' : '100%' }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      );
    }

    if (variant === 'circular') {
      const size = height ?? width ?? '1rem';
      const dimension = typeof size === 'number' ? `${size}px` : String(size);
      return (
        <div
          ref={ref}
          className={`${baseStyles} rounded-full`}
          style={{ ...style, width: dimension, height: dimension } as CSSProperties}
          aria-hidden="true"
          {...props}
        />
      );
    }

    if (variant === 'text') {
      return (
        <div ref={ref} className={`${className} space-y-2`} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={lineStyles}
              style={{ width: i === lines - 1 ? '70%' : '100%' }}
              aria-hidden="true"
            />
          ))}
        </div>
      );
    }

    const w = typeof width === 'number' ? `${width}px` : width;
    const h = typeof height === 'number' ? `${height}px` : height ?? '1rem';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${className}`}
        style={{ ...style, width: w, height: h } as CSSProperties}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export const ProductCardSkeleton = () => (
  <Card variant="bordered" padding="md" className="flex flex-col h-full">
    <Skeleton variant="rectangular" className="aspect-square w-full rounded-xl mb-3" />
    <div className="flex-1 space-y-3">
      <Skeleton variant="text" lines={1} className="h-5" />
      <Skeleton variant="text" lines={1} className="h-4 w-3/4" />
      <Skeleton variant="text" lines={1} className="h-4 w-1/2" />
      <Skeleton variant="text" lines={1} className="h-3 w-2/3" />
    </div>
    <Skeleton variant="rectangular" className="mt-3 h-10 w-full rounded-lg" />
  </Card>
);

export const CartItemSkeleton = () => (
  <li className="flex items-center justify-between gap-3 p-4">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="rectangular" className="h-5 w-3/4 rounded" />
      <Skeleton variant="rectangular" className="h-4 w-1/2 rounded" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton variant="rectangular" className="h-8 w-8 rounded-md" />
      <Skeleton variant="rectangular" className="h-8 w-12 rounded-md" />
      <Skeleton variant="rectangular" className="h-8 w-8 rounded-md" />
      <Skeleton variant="rectangular" className="h-8 w-8 rounded-md" />
    </div>
  </li>
);

export const CheckoutSkeleton = () => (
  <div className="space-y-6">
    <Skeleton variant="rectangular" className="h-6 w-1/4 rounded" />
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" className="h-4 rounded" />
      ))}
    </div>
    <fieldset className="space-y-2">
      <Skeleton variant="rectangular" className="h-5 w-1/3 rounded" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" className="h-14 w-full rounded-lg" />
      ))}
    </fieldset>
    <Skeleton variant="rectangular" className="h-12 w-full rounded-xl" />
  </div>
);