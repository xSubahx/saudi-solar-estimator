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
        <label
          htmlFor={inputId}
          className="block text-sm"
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="absolute left-3 text-sm pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full text-sm',
            'focus:outline-none focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-60',
            prefix ? 'pl-8 pr-4 py-2.5' : 'px-3 py-2.5',
            suffix ? 'pr-12' : '',
            className
          )}
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            // Use CSS custom properties via inline style for focus ring
            // @ts-expect-error CSS custom properties
            '--tw-ring-color': 'var(--accent)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
            props.onBlur?.(e);
          }}
          {...props}
        />
        {suffix && (
          <span
            className="absolute right-3 text-sm pointer-events-none"
            style={{ color: 'var(--text-secondary)' }}
          >
            {suffix}
          </span>
        )}
      </div>
      {hint && !error && (
        <p
          className="text-xs"
          style={{
            fontFamily: 'var(--font-newsreader)',
            color: 'var(--text-tertiary)',
          }}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          className="text-xs"
          style={{ color: 'var(--danger)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
