'use client';

import type { EstimatorResult } from '@/types';
import { formatMonthlySavings, formatSARRange, formatPct, formatCO2, formatPaybackYears } from '@/lib/utils/formatters';

interface KPICardsProps {
  result: EstimatorResult;
}

export function KPICards({ result }: KPICardsProps) {
  const { savings, economics, tariff, annualProductionKwh } = result;

  const monthlySavingsMin = savings.minSarPerYear / 12;
  const monthlySavingsMax = savings.maxSarPerYear / 12;

  // Consumption offset %: how much of annual consumption is covered at the max self-consumption scenario
  const annualConsumption = tariff.annualBill / tariff.blendedRate;
  const offsetPct = annualConsumption > 0
    ? Math.min(100, Math.round((savings.maxKwhSelfConsumedPerYear / annualConsumption) * 100))
    : 0;

  const co2Value = economics
    ? economics.co2OffsetTonnesPerYear
    : annualProductionKwh * 0.00057;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Hero row — monthly savings */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--accent)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <div className="accent-line" style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Estimated Monthly Savings
        </p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', margin: '0 0 4px', fontFamily: 'var(--font-outfit)' }}>
          {formatMonthlySavings(monthlySavingsMin, monthlySavingsMax)}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
          Based on {savings.selfConsumptionRangePct[0]}–{savings.selfConsumptionRangePct[1]}% self-consumption range
        </p>
      </div>

      {/* Supporting metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <SmallKPI
          label="Bill coverage"
          value={formatPct(offsetPct)}
          subtext="of your electricity need"
        />
        <SmallKPI
          label="Annual savings"
          value={formatSARRange(savings.minSarPerYear, savings.maxSarPerYear, 'SAR/yr')}
          subtext="conservative estimate"
        />
        {economics && (
          <SmallKPI
            label="Payback period"
            value={formatPaybackYears(economics.simplePaybackYears)}
            subtext={economics.simplePaybackYears > 25 ? 'exceeds panel lifetime' : 'to recover investment'}
            highlight
          />
        )}
        <SmallKPI
          label="CO\u2082 offset"
          value={formatCO2(co2Value)}
          subtext="emissions avoided"
        />
      </div>
    </div>
  );
}

function SmallKPI({ label, value, subtext, highlight }: { label: string; value: string; subtext: string; highlight?: boolean }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: `1px solid ${highlight ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: '16px',
      padding: '16px',
    }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: highlight ? 'var(--accent)' : 'var(--text-primary)', margin: '0 0 2px', fontFamily: 'var(--font-outfit)' }}>{value}</p>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0 }}>{subtext}</p>
    </div>
  );
}
