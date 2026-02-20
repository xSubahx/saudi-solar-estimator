'use client';

import type { ExportConfig } from '@/types';
import { Input } from '@/components/ui/Input';

interface ExportToggleProps {
  value: ExportConfig;
  onChange: (e: Partial<ExportConfig>) => void;
}

export function ExportToggle({ value, onChange }: ExportToggleProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Do you export excess electricity to the grid?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'No', enabled: false },
            { label: 'Yes', enabled: true },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange({ enabled: opt.enabled })}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                value.enabled === opt.enabled
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange({ enabled: false })}
            className="py-2 px-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            Not sure
          </button>
        </div>
      </div>

      {value.enabled && (
        <div className="space-y-2 border-l-2 border-amber-300 pl-4">
          <Input
            label="Export credit rate"
            type="number"
            min={0}
            max={0.5}
            step={0.01}
            prefix="SAR"
            suffix="/kWh"
            placeholder="e.g. 0.06"
            value={value.creditRatePerKwh ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange({ creditRatePerKwh: isNaN(val) ? null : val });
            }}
            hint="From your SEC net-billing agreement. Leave blank if unknown — export credit is never assumed."
          />
          {value.creditRatePerKwh === null && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
              <p className="text-xs text-blue-700">
                <span className="font-medium">Export credit not set.</span> Savings will be calculated without export revenue. Enter your confirmed rate from SEC to include it.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
