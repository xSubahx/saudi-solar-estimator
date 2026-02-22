import * as React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
  },
  success: {
    backgroundColor: 'var(--success-soft)',
    color: 'var(--success)',
  },
  warning: {
    backgroundColor: 'var(--warning-soft)',
    color: 'var(--warning)',
  },
  info: {
    backgroundColor: 'var(--info-soft)',
    color: 'var(--info)',
  },
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs',
        className
      )}
      style={{
        borderRadius: '9999px',
        fontFamily: 'var(--font-syne)',
        fontWeight: 500,
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
}
