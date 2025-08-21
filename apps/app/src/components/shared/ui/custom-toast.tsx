'use client';

import { toast as sonnerToast } from 'sonner';

interface CustomToastOptions {
  description?: string;
  duration?: number;
}

// Custom toast styles that match the design system
const getToastStyles = (
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  const baseStyles = {
    background: 'var(--background)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    borderRadius: '0px', // Sharp corners to match UI
    fontFamily: 'var(--title-font)', // Use the title font (IosevkaTerm)
    fontSize: '14px',
    fontWeight: '500',
    padding: '12px 16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  };

  switch (type) {
    case 'error':
      return {
        ...baseStyles,
        background: 'var(--destructive)',
        color: 'var(--destructive-foreground)',
        border: '1px solid var(--destructive)',
      };
    case 'warning':
      return {
        ...baseStyles,
        background: 'oklch(0.98 0.02 60)', // Light orange background
        color: 'oklch(0.45 0.12 30)', // Orange text
        border: '1px solid oklch(0.7 0.08 30)', // Orange border
      };
    case 'success':
      return {
        ...baseStyles,
        background: 'var(--accent)',
        color: 'var(--accent-foreground)',
        border: '1px solid var(--border)',
      };
    default:
      return baseStyles;
  }
};

// Custom toast functions
export const toast = {
  success: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.success(message, {
      ...options,
      style: getToastStyles('success'),
      className: 'font-title',
    });
  },

  error: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.error(message, {
      ...options,
      style: getToastStyles('error'),
      className: 'font-title',
    });
  },

  warning: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.warning(message, {
      ...options,
      style: getToastStyles('warning'),
      className: 'font-title',
    });
  },

  info: (message: string, options?: CustomToastOptions) => {
    return sonnerToast(message, {
      ...options,
      style: getToastStyles('info'),
      className: 'font-title',
    });
  },

  // Custom method for camera/device errors with orange styling
  device: (message: string, options?: CustomToastOptions) => {
    return sonnerToast.error(message, {
      ...options,
      style: {
        background: 'oklch(0.98 0.02 60)', // Light orange background like ModelPicker attention state
        color: 'oklch(0.45 0.12 30)', // Orange text
        border: '1px solid oklch(0.7 0.08 30)', // Orange border
        borderRadius: '0px',
        fontFamily: 'var(--title-font)',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      className: 'font-title',
    });
  },
};
