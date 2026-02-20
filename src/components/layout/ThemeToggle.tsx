'use client';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  // Single nullable state avoids calling setState twice in one effect
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setTheme(saved === 'light' ? 'light' : 'dark');
  }, []);

  const toggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Render nothing until client has read localStorage (avoids hydration mismatch)
  if (theme === null) return null;

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        fontSize: '16px',
        lineHeight: 1,
        transition: 'transform 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(30deg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotate(0deg)'; }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
