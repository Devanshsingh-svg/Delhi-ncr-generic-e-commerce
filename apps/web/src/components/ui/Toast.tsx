'use client';

import { Toaster as SonnerToaster, toast, type ToasterProps } from 'sonner';

export interface ToastMessage {
  id?: string | number;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

const defaultOptions: ToasterProps = {
  position: 'bottom-right',
  expand: true,
  closeButton: true,
  richColors: true,
  icons: {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    loading: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    ),
  },
};

export function Toaster() {
  return <SonnerToaster {...defaultOptions} theme="system" />;
}

export const showToast = {
  success: (message: ToastMessage) =>
    toast.success(message.title, {
      description: message.description,
      action: message.action,
      duration: message.duration ?? 4000,
    }),

  error: (message: ToastMessage) =>
    toast.error(message.title, {
      description: message.description,
      action: message.action,
      duration: message.duration ?? 6000,
    }),

  warning: (message: ToastMessage) =>
    toast.warning(message.title, {
      description: message.description,
      action: message.action,
      duration: message.duration ?? 5000,
    }),

  info: (message: ToastMessage) =>
    toast.info(message.title, {
      description: message.description,
      action: message.action,
      duration: message.duration ?? 5000,
    }),

  loading: (message: ToastMessage) =>
    toast.loading(message.title, {
      description: message.description,
      duration: message.duration ?? Infinity,
    }),

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) =>
    toast.promise(promise, messages),

  dismiss: (id?: string | number) => toast.dismiss(id),

  dismissAll: () => toast.dismiss(),
};