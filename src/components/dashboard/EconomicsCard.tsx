'use client';
import type { EconomicsResult } from '@/types';
import { formatPaybackYears, formatCostPerPanel, formatCostPerKwp, formatSAR } from '@/lib/utils/formatters';
import { useThemeColors } from '@/hooks/useThemeColors';

interface EconomicsCardProps {
  economics: EconomicsResult;
}

/**
 * Computes what self-consumption %, export credit, or install cost would
 * bring payback to exactly 25 years. Returns null for any scenario that
 * is not achievable.
 */
function computeBreakEvenScenarios(economics: EconomicsResult) {
  const { totalInstallCostSar, annualSavingsRangeMin, annualSavingsRangeMax } = economics;
  const midSavings = (annualSavingsRangeMin + annualSavingsRangeMax) / 2;
  // Target: payback = totalCost / netSavings = 25
  // So netSavings = totalCost / 25
  const requiredNetSavings = totalInstallCostSar / 25;

  // Current mid self-consumption ratio (inferred from savings proportion)
  // If midSavings > 0, the required SC% is proportional:
  // requiredSC = currentSC × (requiredNetSavings + OM) / midSavings
  // But we don't have OM or SC% directly. Instead, give simpler guidance.

  // Required install cost for 25-yr payback at current savings
  const requiredInstallCost = midSavings > 0 ? midSavings * 25 : null;

  return {
    requiredNetSavingsPerYear: Math.round(requiredNetSavings),
    requiredInstallCostSar: requiredInstallCost != null ? Math.round(requiredInstallCost) : null,
  };
}

export function EconomicsCard({ economics }: EconomicsCardProps) {
  const themeColors = useThemeColors();
  const paybackYears = economics.simplePaybackYears;
  const paybackExceedsLife = paybackYears > 25;
  const paybackNotViable = paybackYears > 50;

  // Ring percentage: capped at 100%, colored by viability
  const paybackPct = Math.min((paybackYears / 25) * 100, 100);
  const ringColor = paybackExceedsLife ? themeColors.warning : themeColors.accent;
  const displayYears = paybackNotViable
    ? 'N/A'
    : paybackYears > 25
      ? '25+'
      : paybackYears.toFixed(1);

  const breakEven = paybackExceedsLife ? computeBreakEvenScenarios(economics) : null;

  return (
    <div
      className="geo-border"
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
        <h3 style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
          Investment Analysis
        </h3>
      </div>

      {/* Payback ring + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke={themeColors.border} strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - paybackPct / 100)}`}
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="40" y="38" textAnchor="middle" fontSize="1.1rem" fontWeight="700" fill={themeColors.textPrimary} fontFamily="var(--font-ibm-plex-mono)">
              {displayYears}
            </text>
            <text x="40" y="52" textAnchor="middle" fontSize="0.6rem" fill={themeColors.textSecondary} fontFamily="var(--font-ibm-plex-mono)">
              yrs
            </text>
          </svg>
        </div>

        <div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            {paybackNotViable ? 'Not viable' : formatPaybackYears(paybackYears)} payback
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            of a 25-year panel lifespan
          </p>
        </div>
      </div>

      {/* Warning banner when payback exceeds panel lifetime */}
      {paybackExceedsLife && (
        <div style={{
          backgroundColor: 'var(--warning-soft)',
          border: '1px solid var(--warning)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            {paybackNotViable
              ? 'Investment does not pay back without export credits'
              : 'Payback exceeds panel lifetime (25 years)'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Saudi electricity rates (0.18 SAR/kWh) are heavily subsidized, making solar ROI challenging.
            Try: increase self-consumption via the slider, enable net billing with export credits,
            or find a lower installation cost.
          </p>
        </div>
      )}

      {/* Break-even scenarios */}
      {breakEven && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            To reach 25-year payback
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>
              Need annual net savings of <strong>SAR {breakEven.requiredNetSavingsPerYear.toLocaleString()}</strong>/yr
            </p>
            {breakEven.requiredInstallCostSar != null && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: 0 }}>
                Or reduce install cost to <strong>SAR {breakEven.requiredInstallCostSar.toLocaleString()}</strong> total
              </p>
            )}
          </div>
        </div>
      )}

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
      borderRadius: 'var(--radius-md)',
      padding: '12px',
    }}>
      <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-syne)', color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        margin: 0,
        color: highlight ? 'var(--accent)' : 'var(--text-primary)',
        fontFamily: 'var(--font-ibm-plex-mono)',
      }}>
        {value}
      </p>
    </div>
  );
}
