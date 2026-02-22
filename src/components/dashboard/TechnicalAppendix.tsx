'use client';
import { useState } from 'react';
import type { EstimatorResult, EstimatorInputs } from '@/types';
import { formatKWh, formatKWp, formatPct } from '@/lib/utils/formatters';

interface TechnicalAppendixProps {
  result: EstimatorResult;
  inputs: EstimatorInputs;
}

export function TechnicalAppendix({ result, inputs }: TechnicalAppendixProps) {
  const [isOpen, setIsOpen] = useState(false);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          backgroundColor: 'var(--bg-secondary)',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-syne)',
        }}
      >
        <span>Technical Details — For Engineers &amp; Installers</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', color: 'var(--accent)' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)' }}>
          {/* System specs */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
              System Specifications
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <SpecRow label="System size" value={formatKWp(result.sizing.systemKwp)} />
              <SpecRow label="Panel count" value={`${result.sizing.panelCount} panels`} />
              <SpecRow label="Annual production" value={formatKWh(result.annualProductionKwh)} />
              <SpecRow label="Specific yield" value={`${Math.round(result.annualProductionKwh / result.sizing.systemKwp)} kWh/kWp`} />
              <SpecRow label="System losses" value={formatPct(inputs.advanced.systemLoss)} />
              <SpecRow label="Roof coverage" value={formatPct(result.sizing.roofCoverage)} />
            </div>
          </div>

          {/* Monthly production table */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
              Monthly Production (kWh)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
              {result.monthlyBreakdown.slice(0, 12).map((m, i) => (
                <div key={i} style={{ textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px 4px' }}>
                  <p style={{ fontSize: '0.65rem', fontFamily: 'var(--font-newsreader)', color: 'var(--text-secondary)', margin: '0 0 4px' }}>{monthNames[i]}</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-ibm-plex-mono)' }}>
                    {Math.round(m.productionKwh)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Data source footnote */}
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-newsreader)', fontStyle: 'italic', marginTop: '20px', marginBottom: 0, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            Solar irradiance data: PVGIS-SARAH3 (Joint Research Centre, European Commission).
            Self-consumption range: Fraunhofer ISE literature (20–40%).
            Estimates only — verify with a qualified solar installer before investing.
          </p>
        </div>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
      <p style={{ fontSize: '0.65rem', fontFamily: 'var(--font-newsreader)', color: 'var(--text-secondary)', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-ibm-plex-mono)' }}>{value}</p>
    </div>
  );
}
