'use client';

import { useState } from 'react';
import type { ConsumptionConfig } from '@/types';
import { Input } from '@/components/ui/Input';
import { estimateKwhFromBill } from '@/lib/calculations/tariff';

interface ConsumptionInputProps {
  value: ConsumptionConfig;
  onChange: (c: Partial<ConsumptionConfig>) => void;
}

export function ConsumptionInput({ value, onChange }: ConsumptionInputProps) {
  const [mode, setMode] = useState<'kwh' | 'sar'>('kwh');
  const [sarAmount, setSarAmount] = useState('');
  const [estimatedKwh, setEstimatedKwh] = useState<number | null>(null);

  function handleSarInput(sarStr: string) {
    setSarAmount(sarStr);
    const sar = parseFloat(sarStr);
    if (!isNaN(sar) && sar > 0) {
      const kwh = estimateKwhFromBill(sar);
      setEstimatedKwh(kwh ? Math.round(kwh) : null);
      if (kwh) onChange({ monthlyKwh: Math.round(kwh) });
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('kwh')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'kwh'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          I know my kWh
        </button>
        <button
          type="button"
          onClick={() => setMode('sar')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            mode === 'sar'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          I only have SAR amount
        </button>
      </div>

      {mode === 'kwh' ? (
        <Input
          label="Monthly electricity consumption"
          type="number"
          min={100}
          max={50000}
          step={100}
          suffix="kWh/mo"
          value={value.monthlyKwh}
          onChange={(e) => onChange({ monthlyKwh: parseFloat(e.target.value) || 0 })}
          hint="From your last electricity bill. Use the average of 3–6 months for best accuracy."
        />
      ) : (
        <div className="space-y-2">
          <Input
            label="Monthly electricity bill"
            type="number"
            min={10}
            max={50000}
            step={10}
            prefix="SAR"
            value={sarAmount}
            onChange={(e) => handleSarInput(e.target.value)}
            hint="Enter your bill amount — we'll estimate kWh using SEC tiered rates"
          />
          {estimatedKwh !== null && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-sm text-amber-800">
                Estimated consumption: <strong>{estimatedKwh.toLocaleString()} kWh/mo</strong>
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                This is an estimate based on SEC residential tariff tiers. The actual value may differ due to fixed charges, VAT, or your customer category.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customer category note */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Residential tariff applied</span> —
          Tier 1: 0.18 SAR/kWh (0–6,000 kWh/mo), Tier 2: 0.30 SAR/kWh (above 6,000 kWh/mo).
          Commercial or custom rates can be set in Advanced Settings.
        </p>
      </div>
    </div>
  );
}
