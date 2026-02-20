import * as React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  suffix?: string;
  prefix?: string;
}

export function Input({
  label,
  hint,
  error,
  suffix,
  prefix,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-slate-500 pointer-events-none">{prefix}</span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error ? 'border-red-400' : 'border-slate-200',
            prefix ? 'pl-8 pr-4 py-2.5' : 'px-3 py-2.5',
            suffix ? 'pr-12' : '',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-slate-500 pointer-events-none">{suffix}</span>
        )}
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
