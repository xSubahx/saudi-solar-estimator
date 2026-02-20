'use client';

import type { EstimatorHook } from '@/hooks/useEstimator';
import { Card, CardTitle } from '@/components/ui/Card';

interface SensitivitySlidersProps {
  estimator: EstimatorHook;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  disabled?: boolean;
  disabledReason?: string;
}

function SliderRow({ label, value, min, max, step, unit, onChange, disabled, disabledReason }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={disabled ? 'text-slate-300' : 'text-amber-600 font-semibold'}>
          {disabled ? '—' : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-500 disabled:accent-slate-200"
      />
      {disabled && disabledReason && (
        <p className="text-xs text-slate-400">{disabledReason}</p>
      )}
      {!disabled && (
        <div className="flex justify-between text-xs text-slate-400">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      )}
    </div>
  );
}

export function SensitivitySliders({ estimator }: SensitivitySlidersProps) {
  const { inputs, updateAdvanced, updateExport, runEstimation } = estimator;
  const netBillingEnabled = inputs.export.enabled;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Sensitivity</CardTitle>
        <button
          type="button"
          onClick={runEstimation}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium"
        >
          Recalculate ↻
        </button>
      </div>
      <div className="space-y-5">
        <SliderRow
          label="System losses"
          value={inputs.advanced.systemLoss}
          min={5}
          max={30}
          step={0.5}
          unit="%"
          onChange={(v) => updateAdvanced({ systemLoss: v })}
        />
        <SliderRow
          label="Panel power density"
          value={inputs.advanced.wPerM2}
          min={180}
          max={310}
          step={2}
          unit=" W/m²"
          onChange={(v) => updateAdvanced({ wPerM2: v })}
        />
        <SliderRow
          label="Export credit rate"
          value={inputs.export.creditRatePerKwh ?? 0}
          min={0}
          max={0.30}
          step={0.01}
          unit=" SAR/kWh"
          disabled={!netBillingEnabled || inputs.export.creditRatePerKwh === null}
          disabledReason={
            !netBillingEnabled
              ? 'Enable net billing in Options to set export rate'
              : 'Enter a confirmed rate in Options to enable this slider'
          }
          onChange={(v) => updateExport({ creditRatePerKwh: v })}
        />
      </div>
      <p className="text-xs text-slate-400 mt-4">
        Adjust sliders, then click Recalculate to update results.
      </p>
    </Card>
  );
}
