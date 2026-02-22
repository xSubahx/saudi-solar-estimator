'use client';

import { useState, useEffect } from 'react';

interface ThemeColors {
  accent: string;
  accentHover: string;
  accentGlow: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  success: string;
  warning: string;
  bgElevated: string;
  bgCard: string;
  bgSecondary: string;
}

const DARK_DEFAULTS: ThemeColors = {
  accent: '#E8A832',
  accentHover: '#D4952A',
  accentGlow: 'rgba(232,168,50,0.15)',
  border: '#252A3A',
  textPrimary: '#F0EDE6',
  textSecondary: '#8A8FA0',
  textTertiary: '#5C6070',
  success: '#34D399',
  warning: '#F59E0B',
  bgElevated: '#1E2333',
  bgCard: '#181C28',
  bgSecondary: '#131620',
};

function readColors(): ThemeColors {
  if (typeof window === 'undefined') return DARK_DEFAULTS;
  const style = getComputedStyle(document.documentElement);
  const get = (prop: string, fallback: string) => style.getPropertyValue(prop).trim() || fallback;
  return {
    accent: get('--accent', DARK_DEFAULTS.accent),
    accentHover: get('--accent-hover', DARK_DEFAULTS.accentHover),
    accentGlow: get('--accent-glow', DARK_DEFAULTS.accentGlow),
    border: get('--border', DARK_DEFAULTS.border),
    textPrimary: get('--text-primary', DARK_DEFAULTS.textPrimary),
    textSecondary: get('--text-secondary', DARK_DEFAULTS.textSecondary),
    textTertiary: get('--text-tertiary', DARK_DEFAULTS.textTertiary),
    success: get('--success', DARK_DEFAULTS.success),
    warning: get('--warning', DARK_DEFAULTS.warning),
    bgElevated: get('--bg-elevated', DARK_DEFAULTS.bgElevated),
    bgCard: get('--bg-card', DARK_DEFAULTS.bgCard),
    bgSecondary: get('--bg-secondary', DARK_DEFAULTS.bgSecondary),
  };
}

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(DARK_DEFAULTS);

  useEffect(() => {
    setColors(readColors());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Small delay to let CSS variables resolve after attribute change
      requestAnimationFrame(() => setColors(readColors()));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
