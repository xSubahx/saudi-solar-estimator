'use client';
import type { EconomicsResult } from '@/types';
import { formatPaybackYears, formatCostPerPanel, formatCostPerKwp, formatSAR } from '@/lib/utils/formatters';

interface EconomicsCardProps {
  economics: EconomicsResult;
}

export function EconomicsCard({ economics }: EconomicsCardProps) {
  const paybackYears = economics.simplePaybackYears;
  const paybackPct = Math.min((paybackYears / 25) * 100, 100);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div className="accent-line" />
        <h3 style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
          Investment Analysis
        </h3>
      </div>

      {/* Payback ring + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - paybackPct / 100)}`}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-outfit)' }}>
              {paybackYears < 100 ? paybackYears.toFixed(1) : '25+'}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>yrs</span>
          </div>
        </div>

        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            {formatPaybackYears(paybackYears)} payback
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            of a 25-year panel lifespan
          </p>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <MetricItem label="Cost per panel" value={formatCostPerPanel(economics.costPerPanel)} />
        <MetricItem label="Cost per kWp" value={formatCostPerKwp(economics.costPerKwp)} />
        <MetricItem label="25-yr net gain" value={formatSAR(economics.cumulativeSavings25yr)} highlight={economics.cumulativeSavings25yr > 0} />
        <MetricItem label="NPV (today)" value={formatSAR(economics.npv25Years)} highlight={economics.npv25Years > 0} />
      </div>
    </div>
  );
}

function MetricItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '10px',
      padding: '12px',
    }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        margin: 0,
        color: highlight ? 'var(--accent)' : 'var(--text-primary)',
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        {value}
      </p>
    </div>
  );
}
