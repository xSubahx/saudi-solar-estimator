import * as React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--accent)',
    color: '#0C0E14',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--danger)',
    color: '#fff',
    border: 'none',
  },
};

const hoverHandlers = {
  primary: {
    onEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      el.style.transform = 'translateY(-1px)';
      el.style.boxShadow = '0 4px 16px var(--accent-glow)';
    },
    onLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
    },
  },
  secondary: {
    onEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.borderColor = 'var(--border-hover)';
    },
    onLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.borderColor = 'var(--border)';
    },
  },
  ghost: {
    onEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
    },
    onLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    },
  },
  danger: {
    onEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      el.style.transform = 'translateY(-1px)';
      el.style.opacity = '0.9';
    },
    onLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      el.style.transform = 'translateY(0)';
      el.style.opacity = '1';
    },
  },
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  className,
  disabled,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-sans font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'text-xs px-3 py-1.5 gap-1': size === 'sm',
          'text-sm px-4 py-2 gap-2': size === 'md',
          'text-base px-6 py-3 gap-2': size === 'lg',
        },
        className
      )}
      style={{
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...variantStyles[variant],
      }}
      onMouseEnter={(e) => {
        hoverHandlers[variant]?.onEnter(e);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        hoverHandlers[variant]?.onLeave(e);
        onMouseLeave?.(e);
      }}
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
