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
          <h3 style={{ fontSize: '0.875rem', fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--text-primary)' }}>How we calculated this</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Transparent methodology with source citations</p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="font-medium ml-4 flex-shrink-0"
          style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-syne)' }}
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
        <div className="mt-4 space-y-4" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {/* Step-by-step */}
          <div className="space-y-2">
            <h4 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--text-primary)' }}>Calculation steps</h4>
            <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid var(--accent)' }}>
              <div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>1. PV System Size</span>
                <br />
                kWp = {inputs.roof.usableAreaM2} m² × ({inputs.advanced.wPerM2} W/m² ÷ 1000) × {inputs.advanced.packingFactor} packing
                = <strong>{sizing.systemKwp} kWp</strong>
              </div>
              <div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>2. Solar Production</span>
                <br />
                PVGIS {pvgisInputs.meteo_data?.radiation_db} at {pvgisInputs.location.latitude.toFixed(4)}°N,{' '}
                {pvgisInputs.location.longitude.toFixed(4)}°E · {inputs.advanced.systemLoss}% system loss
                → <strong>{result.annualProductionKwh.toLocaleString()} kWh/yr</strong>
              </div>
              <div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>3. Baseline Electricity Cost</span>
                <br />
                {inputs.consumption.monthlyKwh.toLocaleString()} kWh/mo → Tier 1: {tariff.tier1Kwh.toLocaleString()} kWh × 0.18 SAR
                + Tier 2: {tariff.tier2Kwh.toLocaleString()} kWh × 0.30 SAR
                = <strong>SAR {tariff.monthlyBill.toLocaleString()}/mo</strong>
              </div>
              <div>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>4. Savings Range</span>
                <br />
                Self-consumption range: {savings.selfConsumptionRangePct[0]}–{savings.selfConsumptionRangePct[1]}% of production
                (Saudi-adjusted from Fraunhofer ISE baseline; higher than European 20–40% due to heavy daytime AC load coinciding with solar peak).
                <br />
                Annual savings = base bill − reduced bill after solar offset.
                → <strong>SAR {savings.minSarPerYear.toLocaleString()} – {savings.maxSarPerYear.toLocaleString()}/yr</strong>
              </div>
              {result.mode === 'net-billing' && inputs.export.creditRatePerKwh !== null && (
                <div>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>5. Export Credit</span>
                  <br />
                  Rate: {inputs.export.creditRatePerKwh} SAR/kWh (user-supplied).
                  Added to savings for energy exported after self-consumption is exhausted.
                </div>
              )}
            </div>
          </div>

          {/* Assumptions table */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Current assumptions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <th style={{ textAlign: 'left', padding: '4px 8px', fontFamily: 'var(--font-syne)', fontWeight: 500, color: 'var(--text-secondary)' }}>Parameter</th>
                    <th style={{ textAlign: 'right', padding: '4px 8px', fontFamily: 'var(--font-syne)', fontWeight: 500, color: 'var(--text-secondary)' }}>Value</th>
                    <th style={{ textAlign: 'left', padding: '4px 8px', fontFamily: 'var(--font-syne)', fontWeight: 500, color: 'var(--text-secondary)' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
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
                    <tr key={row.param} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '4px 8px', fontFamily: 'var(--font-newsreader)', color: 'var(--text-primary)' }}>{row.param}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 500, color: 'var(--text-primary)' }}>{row.value}</td>
                      <td style={{ padding: '4px 8px', color: 'var(--text-tertiary)' }}>{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Caveats */}
          <div style={{ backgroundColor: 'var(--warning-soft)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Important caveats</p>
            <p style={{ color: 'var(--text-secondary)' }}>{ASSUMPTIONS.selfConsumption.rationale}</p>
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong>Why payback may seem long:</strong> Saudi residential electricity is heavily subsidized at 0.18 SAR/kWh (~$0.048 USD/kWh) — roughly 4–7x cheaper than European or US rates where solar typically pays back in 5–10 years. Without export credits (net billing), only self-consumed solar energy generates savings, and the low tariff rate means each kWh saved is worth very little financially. Enabling net billing with export credits is the primary path to viable payback in Saudi Arabia.
            </p>
            {inputs.export.enabled && inputs.export.creditRatePerKwh === null && (
              <p style={{ color: 'var(--text-secondary)' }}>{ASSUMPTIONS.netBilling.exportCreditNote}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
