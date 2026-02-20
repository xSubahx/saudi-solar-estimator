'use client';

import { useState, useCallback } from 'react';
import type {
  EstimatorInputs,
  EstimatorResult,
  WizardStep,
  City,
  RoofConfig,
  ConsumptionConfig,
  AdvancedConfig,
  ExportConfig,
  SavingsMode,
} from '@/types';
import { DEFAULT_CITY } from '@/lib/data/saudiCities';
import { ASSUMPTIONS } from '@/lib/data/assumptions';
import { calculatePVSizing, displayAzimuthToPvgis } from '@/lib/calculations/pvSizing';
import { calculateTariff } from '@/lib/calculations/tariff';
import { calculateSavingsRange } from '@/lib/calculations/savings';
import { calculateEconomics } from '@/lib/calculations/economics';

const DEFAULT_INPUTS: EstimatorInputs = {
  city: DEFAULT_CITY,
  roof: {
    usableAreaM2: 100,
    tiltDeg: 22,
    azimuthDeg: 180, // south-facing — optimal in Saudi Arabia
    shadingLoss: 5,
    useOptimalAngles: false,
  },
  consumption: {
    monthlyKwh: 3000,
    hasAC: true,
    summerPeakMultiplier: 1.8,
  },
  advanced: {
    wPerM2: ASSUMPTIONS.pvSystem.defaultWPerM2,
    packingFactor: ASSUMPTIONS.pvSystem.defaultPackingFactor,
    systemLoss: ASSUMPTIONS.pvSystem.defaultSystemLossPercent,
    inverterEff: ASSUMPTIONS.pvSystem.defaultInverterEffPercent,
    degradationPct: ASSUMPTIONS.pvSystem.defaultDegradationPctPerYear,
    projectLifeYears: ASSUMPTIONS.economics.projectLifeYears,
    installCostPerKwp: ASSUMPTIONS.economics.defaultInstallCostSarPerKwp,
    omCostPerKwpPerYear: ASSUMPTIONS.economics.defaultOmCostSarPerKwpPerYear,
  },
  export: {
    enabled: false,
    creditRatePerKwh: null, // NEVER default — must be user-set
    utilityProgram: '',
  },
};

export function useEstimator() {
  const [inputs, setInputs] = useState<EstimatorInputs>(DEFAULT_INPUTS);
  const [result, setResult] = useState<EstimatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<WizardStep>('location');
  const [savingsMode, setSavingsMode] = useState<SavingsMode>('conservative');

  const updateCity = useCallback((city: City) => {
    setInputs((prev) => ({ ...prev, city }));
  }, []);

  const updateRoof = useCallback((roof: Partial<RoofConfig>) => {
    setInputs((prev) => ({ ...prev, roof: { ...prev.roof, ...roof } }));
  }, []);

  const updateConsumption = useCallback((c: Partial<ConsumptionConfig>) => {
    setInputs((prev) => ({ ...prev, consumption: { ...prev.consumption, ...c } }));
  }, []);

  const updateAdvanced = useCallback((a: Partial<AdvancedConfig>) => {
    setInputs((prev) => ({ ...prev, advanced: { ...prev.advanced, ...a } }));
  }, []);

  const updateExport = useCallback((e: Partial<ExportConfig>) => {
    setInputs((prev) => ({ ...prev, export: { ...prev.export, ...e } }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setResult(null);
    setError(null);
    setStep('location');
    setSavingsMode('conservative');
  }, []);

  const runEstimation = useCallback(async () => {
    if (!inputs.city) {
      setError('Please select a city.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // 1. Size the PV system from roof area
      const sizing = calculatePVSizing(inputs.roof, inputs.advanced);

      // 2. Build PVGIS proxy request
      const pvgisAspect = displayAzimuthToPvgis(inputs.roof.azimuthDeg);
      const searchParams = new URLSearchParams({
        lat: String(inputs.city.lat),
        lon: String(inputs.city.lon),
        peakpower: String(sizing.systemKwp),
        loss: String(inputs.advanced.systemLoss),
        angle: String(inputs.roof.tiltDeg),
        aspect: String(pvgisAspect),
      });

      if (inputs.roof.useOptimalAngles) {
        searchParams.set('optimalangles', '1');
      }

      const res = await fetch(`/api/pvgis?${searchParams.toString()}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error ?? `Solar data fetch failed (${res.status})`);
      }

      const pvgisData = await res.json();

      // 3. Calculate baseline tariff
      const tariff = calculateTariff(inputs.consumption.monthlyKwh);

      // 4. Calculate savings range (always a range, never a single value)
      const { savingsRange, monthlyBreakdown } = calculateSavingsRange(
        pvgisData,
        inputs.consumption,
        inputs.export,
        savingsMode
      );

      // 5. Calculate economics (only if CAPEX is provided)
      const annualProductionKwh: number = pvgisData.outputs.totals.fixed.E_y;
      const economics =
        inputs.advanced.installCostPerKwp > 0
          ? calculateEconomics(
              sizing,
              inputs.advanced,
              annualProductionKwh,
              savingsRange.minSarPerYear,
              savingsRange.maxSarPerYear
            )
          : null;

      setResult({
        sizing,
        pvgisData,
        tariff,
        savings: savingsRange,
        monthlyBreakdown,
        economics,
        mode: savingsMode,
        annualProductionKwh,
        computedAt: Date.now(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Estimation failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [inputs, savingsMode]);

  return {
    inputs,
    result,
    error,
    isLoading,
    step,
    savingsMode,
    setStep,
    setSavingsMode,
    updateCity,
    updateRoof,
    updateConsumption,
    updateAdvanced,
    updateExport,
    resetToDefaults,
    runEstimation,
    defaultInputs: DEFAULT_INPUTS,
  };
}

export type EstimatorHook = ReturnType<typeof useEstimator>;
