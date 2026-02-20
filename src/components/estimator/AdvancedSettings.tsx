'use client';

import { useState } from 'react';
import type { AdvancedConfig } from '@/types';
import { ASSUMPTIONS } from '@/lib/data/assumptions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AdvancedSettingsProps {
  value: AdvancedConfig;
  onChange: (a: Partial<AdvancedConfig>) => void;
  onReset: () => void;
}

export function AdvancedSettings({ value, onChange, onReset }: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const fields = [
    {
      key: 'wPerM2' as const,
      label: 'Panel power density',
      unit: 'W/m²',
      min: 150,
      max: 350,
      step: 1,
      source: ASSUMPTIONS.pvSystem.source,
    },
    {
      key: 'packingFactor' as const,
      label: 'Packing factor',
      unit: '(0–1)',
      min: 0.5,
      max: 1.0,
      step: 0.05,
      source: ASSUMPTIONS.pvSystem.source,
    },
    {
      key: 'systemLoss' as const,
      label: 'System losses',
      unit: '%',
      min: 0,
      max: 50,
      step: 0.5,
      source: ASSUMPTIONS.pvSystem.source,
    },
    {
      key: 'degradationPct' as const,
      label: 'Annual degradation',
      unit: '%/yr',
      min: 0,
      max: 2,
      step: 0.1,
      source: ASSUMPTIONS.pvSystem.source,
    },
    {
      key: 'installCostPerKwp' as const,
      label: 'Install cost',
      unit: 'SAR/kWp',
      min: 1000,
      max: 10000,
      step: 100,
      source: ASSUMPTIONS.economics.source,
    },
    {
      key: 'omCostPerKwpPerYear' as const,
      label: 'O&M cost',
      unit: 'SAR/kWp/yr',
      min: 0,
      max: 500,
      step: 10,
      source: ASSUMPTIONS.economics.source,
    },
    {
      key: 'projectLifeYears' as const,
      label: 'Project lifetime',
      unit: 'years',
      min: 10,
      max: 30,
      step: 1,
      source: ASSUMPTIONS.economics.source,
    },
  ];

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700"
      >
        <span>Advanced assumptions</span>
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Input
                label={field.label}
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                suffix={field.unit}
                value={value[field.key]}
                onChange={(e) =>
                  onChange({ [field.key]: parseFloat(e.target.value) || 0 } as Partial<AdvancedConfig>)
                }
              />
              <p className="text-xs text-slate-400">Source: {field.source.split('.')[0]}</p>
            </div>
          ))}

          <Button variant="ghost" size="sm" onClick={onReset} type="button">
            Reset all to defaults
          </Button>
        </div>
      )}
    </div>
  );
}
