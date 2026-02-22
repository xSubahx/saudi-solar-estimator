'use client';

import type { WizardStep } from '@/types';
import type { EstimatorHook } from '@/hooks/useEstimator';
import { Button } from '@/components/ui/Button';
import { CitySelector } from './CitySelector';
import { RoofAreaInput } from './RoofAreaInput';
import { ConsumptionInput } from './ConsumptionInput';
import { ExportToggle } from './ExportToggle';
import { AdvancedSettings } from './AdvancedSettings';
import { ASSUMPTIONS } from '@/lib/data/assumptions';
import { MapPin, Home, Zap, SlidersHorizontal, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InputFormProps {
  estimator: EstimatorHook;
}

const STEPS: { id: WizardStep; label: string; icon: LucideIcon }[] = [
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'roof', label: 'Roof', icon: Home },
  { id: 'consumption', label: 'Usage', icon: Zap },
  { id: 'options', label: 'Options', icon: SlidersHorizontal },
];

export function InputForm({ estimator }: InputFormProps) {
  const { inputs, step, setStep, updateCity, updateRoof, updateConsumption, updateAdvanced, updateExport, resetToDefaults, runEstimation, isLoading, defaultInputs } = estimator;

  const currentStepIdx = STEPS.findIndex((s) => s.id === step);

  function canProceed(): boolean {
    switch (step) {
      case 'location': return inputs.city !== null;
      case 'roof': return inputs.roof.usableAreaM2 > 0;
      case 'consumption': return inputs.consumption.monthlyKwh > 0;
      default: return true;
    }
  }

  function handleNext() {
    const nextIdx = currentStepIdx + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx].id);
  }

  function handleBack() {
    const prevIdx = currentStepIdx - 1;
    if (prevIdx >= 0) setStep(STEPS[prevIdx].id);
  }

  function getStepStyle(s: typeof STEPS[number], idx: number) {
    if (s.id === step) {
      return {
        backgroundColor: 'var(--accent-soft)',
        borderBottom: '2px solid var(--accent)',
        color: 'var(--accent)',
      };
    }
    if (idx < currentStepIdx) {
      return {
        color: 'var(--success)',
      };
    }
    return {
      color: 'var(--text-tertiary)',
    };
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
      className="shadow-sm overflow-hidden"
    >
      {/* Progress stepper */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className="flex-1 py-3 text-center transition-colors"
              style={getStepStyle(s, idx)}
              onMouseEnter={(e) => {
                if (s.id !== step) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (s.id !== step) {
                  e.currentTarget.style.backgroundColor = '';
                } else {
                  e.currentTarget.style.backgroundColor = 'var(--accent-soft)';
                }
              }}
            >
              <div className="flex justify-center">
                <Icon size={18} />
              </div>
              <div className="text-xs font-medium hidden sm:block">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="p-5 space-y-5">
        {step === 'location' && (
          <>
            <div>
              <h2
                className="text-base"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                Select your city
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-newsreader)' }}
              >
                Solar data will be fetched from PVGIS for this location.
              </p>
            </div>
            <CitySelector value={inputs.city} onChange={updateCity} />
          </>
        )}

        {step === 'roof' && (
          <>
            <div>
              <h2
                className="text-base"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                Your rooftop
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-newsreader)' }}
              >
                Enter the usable area available for solar panels.
              </p>
            </div>
            <RoofAreaInput value={inputs.roof} onChange={updateRoof} />
          </>
        )}

        {step === 'consumption' && (
          <>
            <div>
              <h2
                className="text-base"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                Electricity consumption
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-newsreader)' }}
              >
                From your last electricity bill. The more accurate, the better.
              </p>
            </div>
            <ConsumptionInput value={inputs.consumption} onChange={updateConsumption} />
          </>
        )}

        {step === 'options' && (
          <>
            <div>
              <h2
                className="text-base"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-syne)', fontWeight: 600 }}
              >
                Options
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-newsreader)' }}
              >
                Export to grid and installation cost (optional).
              </p>
            </div>
            <ExportToggle value={inputs.export} onChange={updateExport} />
            <AdvancedSettings
              value={inputs.advanced}
              onChange={updateAdvanced}
              onReset={() => updateAdvanced(defaultInputs.advanced)}
            />
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {currentStepIdx > 0 && (
            <Button variant="secondary" onClick={handleBack} type="button" className="flex-1">
              ← Back
            </Button>
          )}
          {step !== 'options' ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              type="button"
              className="flex-1"
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={runEstimation}
              isLoading={isLoading}
              type="button"
              className="flex-1"
            >
              {isLoading ? 'Calculating…' : <><Sun size={16} style={{ marginRight: 6 }} /> Calculate My Solar Savings</>}
            </Button>
          )}
        </div>

        {/* Quick summary on options step */}
        {step === 'options' && (
          <div
            className="text-xs px-3 py-2 space-y-0.5"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <MapPin size={14} /> {inputs.city?.nameEn}
            </div>
            <div className="flex items-center gap-1.5">
              <Home size={14} /> {inputs.roof.usableAreaM2} m² usable roof
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={14} /> {inputs.consumption.monthlyKwh.toLocaleString()} kWh/mo
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
