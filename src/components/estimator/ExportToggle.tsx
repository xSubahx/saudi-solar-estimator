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
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Do you export excess electricity to the grid?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'No', enabled: false },
            { label: 'Yes', enabled: true },
          ].map((opt) => {
            const isActive = value.enabled === opt.enabled;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ enabled: opt.enabled })}
                className="py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                style={
                  isActive
                    ? { backgroundColor: 'var(--accent)', color: '#0C0E14' }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }
                }
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
              >
                {opt.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onChange({ enabled: false })}
            className="py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
          >
            Not sure
          </button>
        </div>
      </div>

      {value.enabled && (
        <div className="space-y-2 pl-4" style={{ borderLeft: '2px solid var(--accent)' }}>
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
            <div
              className="rounded-lg px-3 py-2"
              style={{
                backgroundColor: 'var(--info-soft)',
                border: '1px solid var(--info)',
              }}
            >
              <p className="text-xs" style={{ color: 'var(--info)' }}>
                <span className="font-medium">Export credit not set.</span> Savings will be calculated without export revenue. Enter your confirmed rate from SEC to include it.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
