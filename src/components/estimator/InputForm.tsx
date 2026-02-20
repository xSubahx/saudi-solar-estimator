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

interface InputFormProps {
  estimator: EstimatorHook;
}

const STEPS: { id: WizardStep; label: string; icon: string }[] = [
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'roof', label: 'Roof', icon: '🏠' },
  { id: 'consumption', label: 'Usage', icon: '⚡' },
  { id: 'options', label: 'Options', icon: '⚙️' },
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Progress stepper */}
      <div className="flex border-b border-slate-100">
        {STEPS.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            className={`flex-1 py-3 text-center transition-colors ${
              s.id === step
                ? 'bg-amber-50 border-b-2 border-amber-500 text-amber-700'
                : idx < currentStepIdx
                ? 'text-green-600 hover:bg-slate-50'
                : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <div className="text-lg">{s.icon}</div>
            <div className="text-xs font-medium hidden sm:block">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="p-5 space-y-5">
        {step === 'location' && (
          <>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Select your city</h2>
              <p className="text-xs text-slate-500 mt-0.5">Solar data will be fetched from PVGIS for this location.</p>
            </div>
            <CitySelector value={inputs.city} onChange={updateCity} />
          </>
        )}

        {step === 'roof' && (
          <>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Your rooftop</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter the usable area available for solar panels.</p>
            </div>
            <RoofAreaInput value={inputs.roof} onChange={updateRoof} />
          </>
        )}

        {step === 'consumption' && (
          <>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Electricity consumption</h2>
              <p className="text-xs text-slate-500 mt-0.5">From your last electricity bill. The more accurate, the better.</p>
            </div>
            <ConsumptionInput value={inputs.consumption} onChange={updateConsumption} />
          </>
        )}

        {step === 'options' && (
          <>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Options</h2>
              <p className="text-xs text-slate-500 mt-0.5">Export to grid and installation cost (optional).</p>
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
              {isLoading ? 'Calculating…' : '☀️ Calculate My Solar Savings'}
            </Button>
          )}
        </div>

        {/* Quick summary on options step */}
        {step === 'options' && (
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 space-y-0.5">
            <div>📍 {inputs.city?.nameEn}</div>
            <div>🏠 {inputs.roof.usableAreaM2} m² usable roof</div>
            <div>⚡ {inputs.consumption.monthlyKwh.toLocaleString()} kWh/mo</div>
          </div>
        )}
      </div>
    </div>
  );
}
