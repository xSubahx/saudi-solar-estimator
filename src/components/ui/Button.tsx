import * as React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          // Variants
          'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500': variant === 'primary',
          'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-slate-400': variant === 'secondary',
          'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400': variant === 'ghost',
          'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500': variant === 'danger',
          // Sizes
          'text-xs px-3 py-1.5 gap-1': size === 'sm',
          'text-sm px-4 py-2 gap-2': size === 'md',
          'text-base px-6 py-3 gap-2': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
