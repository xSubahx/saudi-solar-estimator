'use client';

import { useState } from 'react';
import type { EstimatorResult, EstimatorInputs } from '@/types';
import { ASSUMPTIONS } from '@/lib/data/assumptions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface MethodologyPanelProps {
  result: EstimatorResult;
  inputs: EstimatorInputs;
}

export function MethodologyPanel({ result, inputs }: MethodologyPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { sizing, pvgisData, tariff, savings } = result;
  const pvgisInputs = pvgisData.inputs;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">How we calculated this</h3>
          <p className="text-xs text-slate-500 mt-0.5">Transparent methodology with source citations</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium ml-4 flex-shrink-0"
        >
          {isOpen ? 'Collapse ▲' : 'Expand ▼'}
        </button>
      </div>

      {/* Source trust badges — always visible */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="info">Solar data: PVGIS (JRC, European Commission)</Badge>
        <Badge variant="info">Tariff: SEC residential 2018</Badge>
        <Badge variant="default">Self-consumption: Saudi-adjusted (Fraunhofer ISE base)</Badge>
        {result.mode === 'net-billing' && inputs.export.creditRatePerKwh !== null && (
          <Badge variant="success">Net billing: user-supplied rate</Badge>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4 text-xs text-slate-600">
          {/* Step-by-step */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Calculation steps</h4>
            <div className="space-y-2 pl-3 border-l-2 border-amber-200">
              <div>
                <span className="font-medium text-slate-700">1. PV System Size</span>
                <br />
                kWp = {inputs.roof.usableAreaM2} m² × ({inputs.advanced.wPerM2} W/m² ÷ 1000) × {inputs.advanced.packingFactor} packing
                = <strong>{sizing.systemKwp} kWp</strong>
              </div>
              <div>
                <span className="font-medium text-slate-700">2. Solar Production</span>
                <br />
                PVGIS {pvgisInputs.meteo_data?.radiation_db} at {pvgisInputs.location.latitude.toFixed(4)}°N,{' '}
                {pvgisInputs.location.longitude.toFixed(4)}°E · {inputs.advanced.systemLoss}% system loss
                → <strong>{result.annualProductionKwh.toLocaleString()} kWh/yr</strong>
              </div>
              <div>
                <span className="font-medium text-slate-700">3. Baseline Electricity Cost</span>
                <br />
                {inputs.consumption.monthlyKwh.toLocaleString()} kWh/mo → Tier 1: {tariff.tier1Kwh.toLocaleString()} kWh × 0.18 SAR
                + Tier 2: {tariff.tier2Kwh.toLocaleString()} kWh × 0.30 SAR
                = <strong>SAR {tariff.monthlyBill.toLocaleString()}/mo</strong>
              </div>
              <div>
                <span className="font-medium text-slate-700">4. Savings Range</span>
                <br />
                Self-consumption range: {savings.selfConsumptionRangePct[0]}–{savings.selfConsumptionRangePct[1]}% of production
                (Saudi-adjusted from Fraunhofer ISE baseline; higher than European 20–40% due to heavy daytime AC load coinciding with solar peak).
                <br />
                Annual savings = base bill − reduced bill after solar offset.
                → <strong>SAR {savings.minSarPerYear.toLocaleString()} – {savings.maxSarPerYear.toLocaleString()}/yr</strong>
              </div>
              {result.mode === 'net-billing' && inputs.export.creditRatePerKwh !== null && (
                <div>
                  <span className="font-medium text-slate-700">5. Export Credit</span>
                  <br />
                  Rate: {inputs.export.creditRatePerKwh} SAR/kWh (user-supplied).
                  Added to savings for energy exported after self-consumption is exhausted.
                </div>
              )}
            </div>
          </div>

          {/* Assumptions table */}
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Current assumptions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-2 py-1.5 font-medium text-slate-600">Parameter</th>
                    <th className="text-right px-2 py-1.5 font-medium text-slate-600">Value</th>
                    <th className="text-left px-2 py-1.5 font-medium text-slate-600">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { param: 'Panel power density', value: `${inputs.advanced.wPerM2} W/m²`, source: 'Fraunhofer ISE' },
                    { param: 'Packing factor', value: `${inputs.advanced.packingFactor}`, source: 'User input / default' },
                    { param: 'System losses', value: `${inputs.advanced.systemLoss}%`, source: 'PVGIS baseline' },
                    { param: 'Self-consumption range', value: `${savings.selfConsumptionRangePct[0]}–${savings.selfConsumptionRangePct[1]}%`, source: 'Saudi-adjusted (Fraunhofer ISE base)' },
                    { param: 'Annual degradation', value: `${inputs.advanced.degradationPct}%/yr`, source: 'Fraunhofer ISE' },
                    { param: 'Tier 1 tariff', value: `0.18 SAR/kWh (≤6,000 kWh/mo)`, source: 'SEC 2018' },
                    { param: 'Tier 2 tariff', value: `0.30 SAR/kWh (>6,000 kWh/mo)`, source: 'SEC 2018' },
                    { param: 'Radiation database', value: pvgisInputs.meteo_data?.radiation_db ?? 'PVGIS-SARAH3', source: 'JRC PVGIS v5.3' },
                    { param: 'Export credit rate', value: inputs.export.creditRatePerKwh !== null ? `${inputs.export.creditRatePerKwh} SAR/kWh` : 'Not set', source: inputs.export.creditRatePerKwh !== null ? 'User-supplied' : 'NEVER assumed' },
                  ].map((row) => (
                    <tr key={row.param} className="hover:bg-slate-50">
                      <td className="px-2 py-1.5 text-slate-700">{row.param}</td>
                      <td className="px-2 py-1.5 text-right font-medium text-slate-900">{row.value}</td>
                      <td className="px-2 py-1.5 text-slate-400">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Caveats */}
          <div className="bg-amber-50 rounded-lg px-3 py-2 space-y-1">
            <p className="font-medium text-amber-800">Important caveats</p>
            <p className="text-amber-700">{ASSUMPTIONS.selfConsumption.rationale}</p>
            <p className="text-amber-700">
              <strong>Why payback may seem long:</strong> Saudi residential electricity is heavily subsidized at 0.18 SAR/kWh (~$0.048 USD/kWh) — roughly 4–7x cheaper than European or US rates where solar typically pays back in 5–10 years. Without export credits (net billing), only self-consumed solar energy generates savings, and the low tariff rate means each kWh saved is worth very little financially. Enabling net billing with export credits is the primary path to viable payback in Saudi Arabia.
            </p>
            {inputs.export.enabled && inputs.export.creditRatePerKwh === null && (
              <p className="text-amber-700">{ASSUMPTIONS.netBilling.exportCreditNote}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
