'use client';

import { showToast } from '../components/ui/Toast';

export interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function useToast() {
  const toast = {
    success: (message: ToastMessage) => showToast.success(message),
    error: (message: ToastMessage) => showToast.error(message),
    warning: (message: ToastMessage) => showToast.warning(message),
    info: (message: ToastMessage) => showToast.info(message),
    loading: (message: ToastMessage) => showToast.loading(message),
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      }
    ) => showToast.promise(promise, messages),
    dismiss: (id?: string | number) => showToast.dismiss(id),
    dismissAll: () => showToast.dismissAll(),
  };

  return toast;
}